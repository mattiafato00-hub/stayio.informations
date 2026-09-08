import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // rimuove accenti
    .replace(/[^a-z0-9\s-]/g, "") // rimuove caratteri speciali
    .trim()
    .replace(/\s+/g, "-") // spazi -> trattini
    .replace(/-+/g, "-"); // trattini multipli -> singolo
}

async function generateUniqueSlug(baseName: string): Promise<string> {
  const baseSlug = slugify(baseName) || "bb";
  let candidate = baseSlug;
  let counter = 2;

  while (true) {
    const { data, error } = await supabase
      .from("property_details")
      .select("id")
      .eq("suggested_slug", candidate)
      .maybeSingle();

    if (error) {
      // Se la query fallisce per qualche motivo, meglio non bloccare la creazione:
      // ritorniamo lo slug candidato così com'è, l'unicità verrà controllata a mano se serve.
      break;
    }

    if (!data) break; // slug libero

    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return candidate;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      email,
      address,
      wifi_ssid,
      wifi_password,
      checkin_info,
      checkout_info,
      access_instructions,
      house_rules,
      parking_info,
      luggage_info,
      appliances_info,
      climate_info,
      host_phone,
      host_whatsapp,
      custom_instructions,
      faqs,
    } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Il nome dell'alloggio è obbligatorio." }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Inserisci un'email valida." }, { status: 400 });
    }

    const suggestedSlug = await generateUniqueSlug(name);

    const { data: property, error: insertError } = await supabase
      .from("property_details")
      .insert({
        name: name.trim(),
        address: address || null,
        wifi_ssid: wifi_ssid || null,
        wifi_password: wifi_password || null,
        checkin_info: checkin_info || null,
        checkout_info: checkout_info || null,
        access_instructions: access_instructions || null,
        house_rules: house_rules || null,
        parking_info: parking_info || null,
        luggage_info: luggage_info || null,
        appliances_info: appliances_info || null,
        climate_info: climate_info || null,
        host_phone: host_phone || null,
        host_whatsapp: host_whatsapp || null,
        custom_instructions: custom_instructions || null,
        suggested_slug: suggestedSlug,
        host_email: email.trim(),
        // nfc_source_id resta null: verrà collegato manualmente quando si consegna il tag NFC fisico
      })
      .select("id, edit_token")
      .single();

    if (insertError || !property) {
      console.error("Errore inserimento property:", insertError);
      return NextResponse.json({ error: "Errore nel salvataggio dei dati. Riprova." }, { status: 500 });
    }

    console.log(`Nuovo host B&B registrato: ${name} <${email}> — property_id: ${property.id}`);

    // Se sono state fornite FAQ iniziali, le inseriamo collegate alla nuova property
    if (Array.isArray(faqs) && faqs.length > 0) {
      const faqRows = faqs
        .filter((f: { question?: string; answer?: string }) => f?.question?.trim() && f?.answer?.trim())
        .map((f: { question: string; answer: string }) => ({
          property_id: property.id,
          question: f.question.trim(),
          answer: f.answer.trim(),
        }));

      if (faqRows.length > 0) {
        const { error: faqError } = await supabase.from("property_faqs").insert(faqRows);
        if (faqError) {
          console.error("Errore inserimento FAQ iniziali:", faqError);
          // Non blocchiamo la risposta di successo per un errore sulle FAQ:
          // la property principale è comunque stata creata correttamente.
        }
      }
    }

    return NextResponse.json({
      success: true,
      editToken: property.edit_token,
      suggestedSlug,
    });
  } catch (err) {
    console.error("Errore host-signup:", err);
    return NextResponse.json({ error: "Errore imprevisto. Riprova più tardi." }, { status: 500 });
  }
}