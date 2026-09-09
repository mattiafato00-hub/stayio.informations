import nodemailer from "nodemailer";

const NOTIFY_TO = "stayio267@gmail.com";

// Editor tabella property_details su Supabase (per ritrovare la riga tramite l'ID).
const SUPABASE_ROW_LINK =
  "https://supabase.com/dashboard/project/jevhncphroifhtnuivkv/editor?table=property_details";

type HostNotification = {
  kind: "signup" | "update";
  propertyId: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
};

/**
 * Invia a Stayio una notifica email per registrazione / aggiornamento di un host.
 * Non lancia mai: in caso di errore (o credenziali mancanti) logga soltanto,
 * così il flusso principale della API non viene bloccato.
 */
export async function sendHostNotification(n: HostNotification): Promise<void> {
  try {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;

    if (!user || !pass) {
      console.warn("[host-notify] GMAIL_USER / GMAIL_APP_PASSWORD non configurate: notifica saltata.");
      return;
    }

    const subject =
      n.kind === "signup"
        ? "Nuovo host registrato su Stayio"
        : "Un host ha aggiornato il proprio concierge";

    const timestamp = new Date().toLocaleString("it-IT", {
      timeZone: "Europe/Rome",
      dateStyle: "full",
      timeStyle: "short",
    });

    const contacts = [n.phone, n.whatsapp]
      .map((c) => (typeof c === "string" ? c.trim() : ""))
      .filter((c, i, arr) => c && arr.indexOf(c) === i);

    const lines = [
      n.kind === "signup"
        ? "Un nuovo host ha attivato il concierge digitale."
        : "Un host ha completato o modificato i dati del proprio concierge.",
      "",
      `Nome dell'alloggio: ${n.name?.trim() || "—"}`,
      `Email host: ${n.email?.trim() || "—"}`,
      `Telefono / WhatsApp: ${contacts.length > 0 ? contacts.join(" / ") : "non fornito"}`,
      `Property ID: ${n.propertyId}`,
      `Apri su Supabase: ${SUPABASE_ROW_LINK}`,
      `Data/ora: ${timestamp}`,
    ];

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });

    const info = await transporter.sendMail({
      from: user,
      to: NOTIFY_TO,
      replyTo: n.email?.trim() || undefined,
      subject,
      text: lines.join("\n"),
    });

    console.log(
      `[host-notify] Notifica "${n.kind}" inviata a ${NOTIFY_TO} per property ${n.propertyId} (messageId: ${info.messageId}).`,
    );
  } catch (err) {
    console.error("[host-notify] Invio notifica email fallito:", err);
  }
}
