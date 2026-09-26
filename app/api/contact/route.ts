import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { isHoneypotFilled } from "@/lib/antispam";
import { checkRateLimit, RATE_LIMITS, TOO_MANY_REQUESTS_MESSAGE } from "@/lib/rate-limit";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  LEAD_FIELD_LIMITS,
  MAX_BODY_BYTES,
  optionalSeats,
  optionalText,
  readJsonObject,
  requiredEmail,
  requiredText,
  ValidationError,
} from "@/lib/validation";

const recipient = "stayio267@gmail.com";

export async function POST(request: Request) {
  try {
    const body = await readJsonObject(request, MAX_BODY_BYTES.lead);

    if (isHoneypotFilled(body)) {
      console.warn("[contact] honeypot compilato: richiesta scartata.");
      return NextResponse.json({ success: true });
    }

    const rateLimit = await checkRateLimit(request.headers, RATE_LIMITS.contact);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: TOO_MANY_REQUESTS_MESSAGE },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
      );
    }

    const name = requiredText(body, "name", LEAD_FIELD_LIMITS.name, "Il nome");
    const email = requiredEmail(body);
    const role = requiredText(body, "role", LEAD_FIELD_LIMITS.role, "Il tipo di attività");
    const message = optionalText(body, "message", LEAD_FIELD_LIMITS.message, "Messaggio") ?? "";

    // Campi aggiuntivi per lead qualificati (form ristoranti). Nome del
    // locale e città sono obbligatori per i ristoratori, anche lato server.
    const isRestaurant = role === "Ristoratore";
    const venueName = isRestaurant
      ? requiredText(body, "venueName", LEAD_FIELD_LIMITS.venueName, "Il nome del locale")
      : (optionalText(body, "venueName", LEAD_FIELD_LIMITS.venueName, "Nome del locale") ?? "");
    const city = isRestaurant
      ? requiredText(body, "city", LEAD_FIELD_LIMITS.city, "Il campo Città / zona")
      : (optionalText(body, "city", LEAD_FIELD_LIMITS.city, "Città / zona") ?? "");
    const phone = optionalText(body, "phone", LEAD_FIELD_LIMITS.phone, "Telefono") ?? "";
    const seatsNumber = optionalSeats(body);
    const seats = seatsNumber === null ? "" : String(seatsNumber);

    const extraLines: string[] = [];
    if (venueName) extraLines.push(`Venue: ${venueName}`);
    if (city) extraLines.push(`City / area: ${city}`);
    if (phone) extraLines.push(`Phone: ${phone}`);
    if (seats) extraLines.push(`Seats: ${seats}`);

    // Salva la richiesta in leads PRIMA di tentare l'email — così un
    // contatto non va perso se GMAIL_APP_PASSWORD/GMAIL_USER non sono
    // configurati (vedi il controllo subito sotto) o se l'invio fallisce.
    // Best-effort: un errore qui non deve impedire l'invio dell'email
    // (che resta il canale principale, invariato) né la risposta al form.
    const supabase = getSupabaseAdmin();
    const { error: leadError } = await supabase.from("leads").insert({
      name,
      email,
      role,
      message: [...extraLines, "", message || "No additional message."].join("\n").trim(),
    });
    if (leadError) {
      console.error("[contact] Impossibile salvare il lead:", leadError.message);
    }

    if (!process.env.GMAIL_APP_PASSWORD || !process.env.GMAIL_USER) {
      return NextResponse.json({ error: "Invio non disponibile al momento. Riprova più tardi." }, { status: 503 });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const lines = [`Name: ${name}`, `Email: ${email}`, `Role: ${role}`, ...extraLines];
    lines.push("", message || "No additional message.");

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: recipient,
      replyTo: email,
      subject: venueName
        ? `New Stayio enquiry — ${venueName} (${name})`
        : `New Stayio enquiry from ${name}`,
      text: lines.join("\n"),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[contact] Errore:", err);
    return NextResponse.json({ error: "Non siamo riusciti a inviare la richiesta. Riprova." }, { status: 500 });
  }
}
