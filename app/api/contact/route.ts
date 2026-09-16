import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const recipient = "stayio267@gmail.com";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, serviceRoleKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const role = typeof body.role === "string" ? body.role.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    // Campi aggiuntivi per lead qualificati (es. form ristoranti) — tutti facoltativi.
    const venueName = typeof body.venueName === "string" ? body.venueName.trim() : "";
    const city = typeof body.city === "string" ? body.city.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const seats =
      typeof body.seats === "string" || typeof body.seats === "number"
        ? String(body.seats).trim()
        : "";

    if (!name || !email || !role) {
      return NextResponse.json({ error: "Please complete the required fields." }, { status: 400 });
    }

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
      return NextResponse.json({ error: "Email delivery is not configured yet." }, { status: 503 });
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
  } catch {
    return NextResponse.json({ error: "We could not send your message. Please try again." }, { status: 500 });
  }
}
