import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Campi testuali di property_details modificabili dall'host tramite il link personale.
const EDITABLE_FIELDS = [
  "name",
  "address",
  "wifi_ssid",
  "wifi_password",
  "checkin_info",
  "checkout_info",
  "access_instructions",
  "house_rules",
  "parking_info",
  "luggage_info",
  "appliances_info",
  "climate_info",
  "host_phone",
  "host_whatsapp",
  "custom_instructions",
] as const;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function cleanText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const token = typeof body.token === "string" ? body.token.trim() : "";
    if (!UUID_RE.test(token)) {
      return NextResponse.json({ error: "Link non valido." }, { status: 400 });
    }

    // Verifica che il link corrisponda a una property esistente.
    const { data: property, error: lookupError } = await supabase
      .from("property_details")
      .select("id")
      .eq("edit_token", token)
      .maybeSingle();

    if (lookupError) {
      console.error("Errore lookup property (host-update):", lookupError);
      return NextResponse.json({ error: "Errore nel salvataggio. Riprova." }, { status: 500 });
    }

    if (!property) {
      return NextResponse.json({ error: "Link non valido o scaduto." }, { status: 404 });
    }

    // Il nome dell'alloggio non può essere svuotato.
    if (Object.prototype.hasOwnProperty.call(body, "name") && !cleanText(body.name)) {
      return NextResponse.json({ error: "Il nome dell'alloggio è obbligatorio." }, { status: 400 });
    }

    const updates: Record<string, string | null> = {};
    for (const field of EDITABLE_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        updates[field] = cleanText(body[field]);
      }
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

    // FAQ: sostituzione completa (lista inviata dal form = stato finale desiderato).
    if (Array.isArray(body.faqs)) {
      const faqRows = body.faqs
        .filter((f: { question?: string; answer?: string }) => cleanText(f?.question) && cleanText(f?.answer))
        .map((f: { question: string; answer: string }, index: number) => ({
          property_id: property.id,
          question: f.question.trim(),
          answer: f.answer.trim(),
          sort_order: index,
        }));

      const { error: deleteError } = await supabase
        .from("property_faqs")
        .delete()
        .eq("property_id", property.id);

      if (deleteError) {
        console.error("Errore delete FAQ (host-update):", deleteError);
        return NextResponse.json({ error: "Errore nel salvataggio delle FAQ. Riprova." }, { status: 500 });
      }

      if (faqRows.length > 0) {
        const { error: insertError } = await supabase.from("property_faqs").insert(faqRows);
        if (insertError) {
          console.error("Errore insert FAQ (host-update):", insertError);
          return NextResponse.json({ error: "Errore nel salvataggio delle FAQ. Riprova." }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Errore host-update:", err);
    return NextResponse.json({ error: "Errore imprevisto. Riprova più tardi." }, { status: 500 });
  }
}
