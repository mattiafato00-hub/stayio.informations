import { after, NextRequest, NextResponse } from "next/server";

import { sendHostNotification } from "@/lib/host-notify";
import { checkRateLimit, RATE_LIMITS, TOO_MANY_REQUESTS_MESSAGE } from "@/lib/rate-limit";
import { keepActiveIds, MAX_RECOMMENDED_RESTAURANTS, sanitizeRecommendedIds } from "@/lib/recommended-restaurants";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  MAX_BODY_BYTES,
  optionalText,
  parseFaqs,
  PROPERTY_FIELD_LIMITS,
  type PropertyField,
  readJsonObject,
  ValidationError,
} from "@/lib/validation";

// Campi testuali di property_details modificabili dall'host tramite il link
// personale (allowlist: qualunque altra chiave del body viene ignorata).
const EDITABLE_FIELDS = Object.keys(PROPERTY_FIELD_LIMITS) as PropertyField[];

const FIELD_LABELS: Record<PropertyField, string> = {
  name: "Nome dell'alloggio",
  address: "Indirizzo",
  wifi_ssid: "Nome rete Wi-Fi",
  wifi_password: "Password Wi-Fi",
  checkin_info: "Check-in",
  checkout_info: "Check-out",
  access_instructions: "Come si accede",
  house_rules: "Regole della casa",
  parking_info: "Parcheggio",
  waste_info: "Rifiuti",
  luggage_info: "Deposito bagagli",
  appliances_info: "Elettrodomestici",
  climate_info: "Riscaldamento / aria condizionata",
  host_phone: "Telefono",
  host_whatsapp: "WhatsApp",
  custom_instructions: "Note aggiuntive",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  try {
    const body = await readJsonObject(request, MAX_BODY_BYTES.hostUpdate);

    const rateLimit = await checkRateLimit(request.headers, RATE_LIMITS.hostUpdate);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: TOO_MANY_REQUESTS_MESSAGE },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
      );
    }

    const token = typeof body.token === "string" ? body.token.trim() : "";
    if (!UUID_RE.test(token)) {
      return NextResponse.json({ error: "Link non valido." }, { status: 400 });
    }

    // Validazione completa PRIMA di qualsiasi lettura/scrittura sul DB.
    const updates: Partial<Record<PropertyField, string | null>> = {};
    for (const field of EDITABLE_FIELDS) {
      const value = optionalText(body, field, PROPERTY_FIELD_LIMITS[field], FIELD_LABELS[field]);
      if (value !== undefined) updates[field] = value;
    }

    // Il nome dell'alloggio non può essere svuotato.
    if ("name" in updates && !updates.name) {
      return NextResponse.json({ error: "Il nome dell'alloggio è obbligatorio." }, { status: 400 });
    }

    const faqs = parseFaqs(body.faqs);

    // Ristoranti consigliati: id non validi/duplicati/non più attivi scartati
    // in silenzio (come le FAQ incomplete); oltre il limite → errore
    // esplicito, verificato PRIMA di qualsiasi scrittura.
    let recommendedIds = sanitizeRecommendedIds(body.recommendedRestaurantIds);
    if (recommendedIds && recommendedIds.length > MAX_RECOMMENDED_RESTAURANTS) {
      return NextResponse.json(
        { error: `Puoi consigliare al massimo ${MAX_RECOMMENDED_RESTAURANTS} ristoranti.` },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();

    // Verifica che il link corrisponda a una property esistente.
    const { data: property, error: lookupError } = await supabase
      .from("property_details")
      .select("id, name, host_email, host_phone, host_whatsapp")
      .eq("edit_token", token)
      .maybeSingle();

    if (lookupError) {
      console.error("Errore lookup property (host-update):", lookupError);
      return NextResponse.json({ error: "Errore nel salvataggio. Riprova." }, { status: 500 });
    }

    if (!property) {
      return NextResponse.json({ error: "Link non valido o scaduto." }, { status: 404 });
    }

    if (recommendedIds && recommendedIds.length > 0) {
      const { data: active, error: activeError } = await supabase
        .from("public_restaurants")
        .select("id")
        .in("id", recommendedIds);

      if (activeError) {
        console.error("Errore lookup ristoranti (host-update):", activeError);
        return NextResponse.json({ error: "Errore nel salvataggio. Riprova." }, { status: 500 });
      }
      recommendedIds = keepActiveIds(recommendedIds, (active ?? []).map((r) => r.id as string));
    }

    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from("property_details")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", property.id);

      if (updateError) {
        console.error("Errore update property (host-update):", updateError);
        return NextResponse.json({ error: "Errore nel salvataggio. Riprova." }, { status: 500 });
      }
    }

    // FAQ: la lista inviata dal form è lo stato finale desiderato. Prima si
    // inseriscono le nuove righe, poi si cancellano solo le altre: se
    // l'inserimento fallisce le FAQ esistenti restano intatte (prima si
    // cancellava tutto e poi si reinseriva, con perdita dei dati in caso di
    // errore a metà).
    if (faqs) {
      let newIds: string[] = [];
      if (faqs.length > 0) {
        const { data: inserted, error: insertError } = await supabase
          .from("property_faqs")
          .insert(
            faqs.map((f, index) => ({
              property_id: property.id,
              question: f.question,
              answer: f.answer,
              sort_order: index,
            })),
          )
          .select("id");

        if (insertError) {
          console.error("Errore insert FAQ (host-update):", insertError);
          return NextResponse.json({ error: "Errore nel salvataggio delle FAQ. Riprova." }, { status: 500 });
        }
        newIds = (inserted ?? []).map((r) => r.id as string);
      }

      let cleanup = supabase.from("property_faqs").delete().eq("property_id", property.id);
      if (newIds.length > 0) cleanup = cleanup.not("id", "in", `(${newIds.join(",")})`);
      const { error: deleteError } = await cleanup;

      if (deleteError) {
        // Le nuove FAQ sono salvate; restano anche le vecchie finché un
        // nuovo salvataggio non completa la pulizia. Nessun dato perso.
        console.error("Errore delete FAQ precedenti (host-update):", deleteError);
        return NextResponse.json({ error: "Errore nel salvataggio delle FAQ. Riprova." }, { status: 500 });
      }
    }

    // Ristoranti consigliati: sostituzione completa, come le FAQ.
    if (recommendedIds) {
      const { error: deleteError } = await supabase
        .from("property_recommended_restaurants")
        .delete()
        .eq("property_id", property.id);

      if (deleteError) {
        console.error("Errore delete ristoranti consigliati (host-update):", deleteError);
        return NextResponse.json({ error: "Errore nel salvataggio dei ristoranti. Riprova." }, { status: 500 });
      }

      if (recommendedIds.length > 0) {
        const { error: insertError } = await supabase.from("property_recommended_restaurants").insert(
          recommendedIds.map((activityId, index) => ({
            property_id: property.id,
            activity_id: activityId,
            sort_order: index,
          })),
        );
        if (insertError) {
          console.error("Errore insert ristoranti consigliati (host-update):", insertError);
          return NextResponse.json({ error: "Errore nel salvataggio dei ristoranti. Riprova." }, { status: 500 });
        }
      }
    }

    // Notifica email a Stayio, eseguita dopo la risposta (after): non aggiunge
    // latenza e un eventuale errore non tocca la risposta di successo.
    after(() =>
      sendHostNotification({
        kind: "update",
        propertyId: property.id,
        name: "name" in updates ? updates.name : property.name,
        email: property.host_email,
        phone: "host_phone" in updates ? updates.host_phone : property.host_phone,
        whatsapp: "host_whatsapp" in updates ? updates.host_whatsapp : property.host_whatsapp,
      }),
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("Errore host-update:", err);
    return NextResponse.json({ error: "Errore imprevisto. Riprova più tardi." }, { status: 500 });
  }
}
