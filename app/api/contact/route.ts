import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

const recipient = "stayio267@gmail.com";

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

    const lines = [`Name: ${name}`, `Email: ${email}`, `Role: ${role}`];
    if (venueName) lines.push(`Venue: ${venueName}`);
    if (city) lines.push(`City / area: ${city}`);
    if (phone) lines.push(`Phone: ${phone}`);
    if (seats) lines.push(`Seats: ${seats}`);
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
