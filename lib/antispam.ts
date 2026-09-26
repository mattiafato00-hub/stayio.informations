// Anti-spam dei form pubblici: honeypot e IP del chiamante. Nessun import:
// usato sia dai form (nome del campo honeypot) sia dal server, e testato
// direttamente con `node --test`.

// ---------- honeypot ----------

/**
 * Campo nascosto nei form: invisibile e non raggiungibile da tastiera per
 * una persona, ma molti bot compilano ogni input che trovano. Se arriva
 * valorizzato, la richiesta viene scartata in silenzio (risposta di
 * successo finta, nessun salvataggio, nessuna email).
 */
export const HONEYPOT_FIELD = "company_website";

export function isHoneypotFilled(body: Record<string, unknown>): boolean {
  const value = body[HONEYPOT_FIELD];
  return typeof value === "string" ? value.trim().length > 0 : value !== undefined && value !== null;
}

// ---------- IP ----------

const HEX_GROUP = /^[0-9a-fA-F]{1,4}$/;
const IPV4_MAPPED = /^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/i;

function expandIpv6(ip: string): string[] | null {
  const clean = ip.replace(/^\[|\]$/g, "").split("%")[0];
  const parts = clean.split("::");
  if (parts.length > 2) return null;

  const head = parts[0] ? parts[0].split(":") : [];
  const tail = parts.length === 2 && parts[1] ? parts[1].split(":") : [];
  const missing = 8 - head.length - tail.length;
  if (missing < 0 || (parts.length === 1 && missing !== 0)) return null;

  const groups = [...head, ...Array(missing).fill("0"), ...tail];
  if (groups.length !== 8 || !groups.every((g) => HEX_GROUP.test(g))) return null;
  return groups.map((g) => parseInt(g, 16).toString(16));
}

/**
 * Normalizza l'IP prima dell'hash (stessa logica di stayio.it):
 * - IPv4-mapped (::ffff:x.x.x.x) → il suo IPv4;
 * - IPv4 → invariato;
 * - IPv6 → prefisso /64, così chi cambia gli ultimi 64 bit a ogni
 *   connessione non aggira il limite;
 * - formato non riconosciuto → invariato.
 */
export function normalizeIp(ip: string): string {
  const mapped = IPV4_MAPPED.exec(ip);
  if (mapped) return mapped[1];
  if (!ip.includes(":")) return ip;
  const groups = expandIpv6(ip);
  if (!groups) return ip;
  return groups.slice(0, 4).join(":") + "::";
}

/**
 * IP del chiamante dagli header impostati da Vercel (`x-real-ip`, poi il
 * primo valore di `x-forwarded-for`). In locale, senza header, "unknown".
 */
export function getClientIp(headers: Headers): string {
  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const first = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return first || "unknown";
}
