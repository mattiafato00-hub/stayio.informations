// Limiti e validazione degli input dei form (lato server; le costanti
// sono usate anche dai form per i maxLength). Nessun import: il modulo è
// testato direttamente con `node --test`, come recommended-restaurants.

// ---------- limiti ----------

/** Tetto sul body delle richieste, in byte. */
export const MAX_BODY_BYTES = {
  lead: 16 * 1024,
  hostUpdate: 200 * 1024,
} as const;

/** Lunghezze massime dei campi del concierge (property_details). */
export const PROPERTY_FIELD_LIMITS = {
  name: 120,
  address: 300,
  wifi_ssid: 100,
  wifi_password: 100,
  checkin_info: 2000,
  checkout_info: 2000,
  access_instructions: 2000,
  house_rules: 2000,
  parking_info: 2000,
  waste_info: 2000,
  luggage_info: 2000,
  appliances_info: 2000,
  climate_info: 2000,
  host_phone: 40,
  host_whatsapp: 40,
  custom_instructions: 2000,
} as const;

export type PropertyField = keyof typeof PROPERTY_FIELD_LIMITS;

export const FAQ_LIMITS = { maxItems: 30, question: 200, answer: 1000 } as const;

/** Lunghezze massime dei campi dei form lead (/api/contact, /api/host-signup). */
export const LEAD_FIELD_LIMITS = {
  name: 120,
  email: 254,
  role: 60,
  message: 3000,
  venueName: 120,
  city: 80,
  phone: 40,
} as const;

export const MAX_SEATS = 9999;

// ---------- errori ----------

/** Errore di validazione: il messaggio è pensato per l'utente. */
export class ValidationError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "ValidationError";
    this.status = status;
  }
}

// ---------- body ----------

/**
 * Legge il body come oggetto JSON. 413 oltre `maxBytes`, 400 se non è
 * JSON valido o non è un oggetto (null, array, stringa…).
 */
export async function readJsonObject(request: Request, maxBytes: number): Promise<Record<string, unknown>> {
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) {
    throw new ValidationError("Richiesta troppo grande.", 413);
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).length > maxBytes) {
    throw new ValidationError("Richiesta troppo grande.", 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    throw new ValidationError("Richiesta non valida.");
  }

  if (!isPlainObject(body)) throw new ValidationError("Richiesta non valida.");
  return body;
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// ---------- campi ----------

/**
 * Campo testuale facoltativo:
 * - assente → undefined (il chiamante non tocca il valore esistente);
 * - null o stringa vuota/solo spazi → null;
 * - stringa → trim, errore se supera `max`;
 * - qualunque altro tipo → errore (prima veniva svuotato in silenzio).
 */
export function optionalText(
  body: Record<string, unknown>,
  key: string,
  max: number,
  label: string,
): string | null | undefined {
  if (!Object.prototype.hasOwnProperty.call(body, key)) return undefined;
  const value = body[key];
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") throw new ValidationError(`${label}: valore non valido.`);
  const trimmed = value.trim();
  if (trimmed.length > max) throw new ValidationError(`${label}: massimo ${max} caratteri.`);
  return trimmed.length > 0 ? trimmed : null;
}

/** Campo testuale obbligatorio: come optionalText, ma assente/vuoto → errore. */
export function requiredText(body: Record<string, unknown>, key: string, max: number, label: string): string {
  const value = optionalText(body, key, max, label);
  if (!value) throw new ValidationError(`${label} è obbligatorio.`);
  return value;
}

const EMAIL_RE = /^[^\s@<>(),;:"[\]]+@[^\s@<>(),;:"[\]]+\.[^\s@<>(),;:"[\]]{2,}$/;

export function isValidEmail(value: string): boolean {
  return value.length <= LEAD_FIELD_LIMITS.email && EMAIL_RE.test(value);
}

/** Email obbligatoria e valida (una sola, niente liste né nomi visualizzati). */
export function requiredEmail(body: Record<string, unknown>, key = "email"): string {
  const value = optionalText(body, key, LEAD_FIELD_LIMITS.email, "Email");
  if (!value || !isValidEmail(value)) throw new ValidationError("Inserisci un'email valida.");
  return value;
}

/** Numero di coperti: facoltativo, intero tra 0 e MAX_SEATS (anche come stringa). */
export function optionalSeats(body: Record<string, unknown>, key = "seats"): number | null {
  const value = body[key];
  if (value === undefined || value === null || value === "") return null;
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value.trim()) : NaN;
  if (!Number.isInteger(n) || n < 0 || n > MAX_SEATS) {
    throw new ValidationError("Numero di coperti non valido.");
  }
  return n;
}

// ---------- FAQ ----------

export type FaqInput = { question: string; answer: string };

/**
 * FAQ inviate dal form del concierge:
 * - campo assente → null (le FAQ esistenti non si toccano);
 * - non array, oltre FAQ_LIMITS.maxItems, elementi non oggetto o
 *   domanda/risposta non testuali o troppo lunghe → errore;
 * - righe con domanda o risposta vuota → scartate (come prima).
 */
export function parseFaqs(value: unknown): FaqInput[] | null {
  if (value === undefined) return null;
  if (!Array.isArray(value)) throw new ValidationError("Domande frequenti: formato non valido.");
  if (value.length > FAQ_LIMITS.maxItems) {
    throw new ValidationError(`Puoi inserire al massimo ${FAQ_LIMITS.maxItems} domande frequenti.`);
  }

  const faqs: FaqInput[] = [];
  value.forEach((item, index) => {
    if (!isPlainObject(item)) throw new ValidationError("Domande frequenti: formato non valido.");
    const question = optionalText(item, "question", FAQ_LIMITS.question, `Domanda ${index + 1}`);
    const answer = optionalText(item, "answer", FAQ_LIMITS.answer, `Risposta ${index + 1}`);
    if (question && answer) faqs.push({ question, answer });
  });
  return faqs;
}
