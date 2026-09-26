import { after, NextRequest, NextResponse } from "next/server";

import { isHoneypotFilled } from "@/lib/antispam";
import { sendHostNotification } from "@/lib/host-notify";
import { checkRateLimit, RATE_LIMITS, TOO_MANY_REQUESTS_MESSAGE } from "@/lib/rate-limit";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  LEAD_FIELD_LIMITS,
  MAX_BODY_BYTES,
  optionalText,
  readJsonObject,
  requiredEmail,
  requiredText,
  ValidationError,
} from "@/lib/validation";

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
    const body = await readJsonObject(request, MAX_BODY_BYTES.lead);

    if (isHoneypotFilled(body)) {
      console.warn("[host-signup] honeypot compilato: richiesta scartata.");
      return NextResponse.json({ success: true });
    }

    const rateLimit = await checkRateLimit(request.headers, RATE_LIMITS.hostSignup);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: TOO_MANY_REQUESTS_MESSAGE },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
      );
    }

    const name = requiredText(body, "name", LEAD_FIELD_LIMITS.name, "Il nome dell'alloggio");
    const email = requiredEmail(body);
    const phone = optionalText(body, "host_phone", LEAD_FIELD_LIMITS.phone, "Telefono") ?? "";
    const whatsapp = optionalText(body, "host_whatsapp", LEAD_FIELD_LIMITS.phone, "WhatsApp") ?? "";

    const messageLines: string[] = [];
    if (phone) messageLines.push(`Telefono: ${phone}`);
    if (whatsapp && whatsapp !== phone) messageLines.push(`WhatsApp: ${whatsapp}`);

    const supabase = getSupabaseAdmin();
    const { error: leadError } = await supabase.from("leads").insert({
      name,
      email,
      role: "host-signup",
      message: messageLines.join("\n") || null,
    });

    if (leadError) {
      console.error("Errore inserimento lead (host-signup):", leadError.message);
      return NextResponse.json({ error: "Errore nel salvataggio dei dati. Riprova." }, { status: 500 });
    }

    console.log(`Nuova richiesta host salvata in leads: ${name} <${email}>`);

    // Notifica email a Stayio, eseguita dopo la risposta (after): non aggiunge
    // latenza e un eventuale errore non tocca la risposta di successo.
    after(() =>
      sendHostNotification({
        kind: "signup",
        propertyId: null,
        name,
        email,
        phone: phone || null,
        whatsapp: whatsapp || null,
      }),
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("Errore host-signup:", err);
    return NextResponse.json({ error: "Errore imprevisto. Riprova più tardi." }, { status: 500 });
  }
}
