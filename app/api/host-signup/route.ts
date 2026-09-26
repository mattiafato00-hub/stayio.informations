import { after, NextRequest, NextResponse } from "next/server";

import { sendHostNotification } from "@/lib/host-notify";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

/**
 * Prima creava subito una property_details reale, senza nessun
 * controllo admin — un form pubblico, senza protezione anti-spam, che
 * poteva scrivere righe vere nel DB. Ora salva solo la richiesta in
 * leads (stessa tabella, stessa logica di /api/contact): la property
 * la crea l'admin a mano da /admin/concierge, guardando /admin/leads,
 * quando decide di dare seguito al contatto. Il massimo che un abuso
 * può fare oggi è riempire leads (sola lettura, nessun impatto), non
 * più creare property vere.
 *
 * sendHostNotification resta invariata: l'email a stayio267@gmail.com
 * deve continuare a partire esattamente come prima.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, email, host_phone, host_whatsapp } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Il nome dell'alloggio è obbligatorio." }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Inserisci un'email valida." }, { status: 400 });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const phone = typeof host_phone === "string" ? host_phone.trim() : "";
    const whatsapp = typeof host_whatsapp === "string" ? host_whatsapp.trim() : "";

    const messageLines: string[] = [];
    if (phone) messageLines.push(`Telefono: ${phone}`);
    if (whatsapp && whatsapp !== phone) messageLines.push(`WhatsApp: ${whatsapp}`);

    const supabase = getSupabaseAdmin();
    const { error: leadError } = await supabase.from("leads").insert({
      name: trimmedName,
      email: trimmedEmail,
      role: "host-signup",
      message: messageLines.join("\n") || null,
    });

    if (leadError) {
      console.error("Errore inserimento lead (host-signup):", leadError.message);
      return NextResponse.json({ error: "Errore nel salvataggio dei dati. Riprova." }, { status: 500 });
    }

    console.log(`Nuova richiesta host salvata in leads: ${trimmedName} <${trimmedEmail}>`);

    // Notifica email a Stayio, eseguita dopo la risposta (after): non aggiunge
    // latenza e un eventuale errore non tocca la risposta di successo.
    after(() =>
      sendHostNotification({
        kind: "signup",
        propertyId: null,
        name: trimmedName,
        email: trimmedEmail,
        phone: phone || null,
        whatsapp: whatsapp || null,
      }),
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Errore host-signup:", err);
    return NextResponse.json({ error: "Errore imprevisto. Riprova più tardi." }, { status: 500 });
  }
}
