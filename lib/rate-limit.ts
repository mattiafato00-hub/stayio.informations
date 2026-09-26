import { createHmac } from "node:crypto";

import { getClientIp, normalizeIp } from "@/lib/antispam";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

// Rate limit per IP dei form pubblici. Riusa la tabella condivisa
// rate_limit_counters e l'RPC atomico rate_limit_increment (migrazione
// 0024 del repo stayio): nessuna nuova tabella. Scope con prefisso "biz_",
// separati da quelli della chat concierge di stayio.it.
//
// Nel DB finisce solo un HMAC-SHA256 dell'IP, mai l'IP in chiaro. Chiave:
// RATE_LIMIT_IP_SALT se impostata, altrimenti la service role key (già
// segreta e solo lato server), così non serve una nuova variabile.
//
// Fail-open: se il DB o la chiave non sono disponibili si logga l'errore
// e si lascia passare la richiesta. Perdere una richiesta vera per un
// problema tecnico costa più di qualche spam (l'honeypot resta attivo).

export type RateLimitRule = { scope: string; limit: number; windowSeconds: number };

export const RATE_LIMITS = {
  contact: [
    { scope: "biz_contact:ip:10m", limit: 5, windowSeconds: 10 * 60 },
    { scope: "biz_contact:ip:24h", limit: 20, windowSeconds: 24 * 60 * 60 },
  ],
  hostSignup: [
    { scope: "biz_host_signup:ip:10m", limit: 5, windowSeconds: 10 * 60 },
    { scope: "biz_host_signup:ip:24h", limit: 20, windowSeconds: 24 * 60 * 60 },
  ],
  hostUpdate: [{ scope: "biz_host_update:ip:10m", limit: 30, windowSeconds: 10 * 60 }],
} satisfies Record<string, RateLimitRule[]>;

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

function hashIp(ip: string): string | null {
  const key = process.env.RATE_LIMIT_IP_SALT?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;
  return createHmac("sha256", key).update(normalizeIp(ip)).digest("hex");
}

/**
 * Incrementa tutti i contatori delle regole (ogni tentativo conta, anche
 * se poi il body non è valido) e nega se almeno uno supera il limite.
 */
export async function checkRateLimit(headers: Headers, rules: RateLimitRule[]): Promise<RateLimitResult> {
  try {
    const bucket = hashIp(getClientIp(headers));
    if (!bucket) {
      console.error("[rate-limit] nessuna chiave per l'hash dell'IP: limite saltato.");
      return { allowed: true };
    }

    const supabase = getSupabaseAdmin();
    let retryAfterSeconds = 0;

    for (const rule of rules) {
      const { data: count, error } = await supabase.rpc("rate_limit_increment", {
        p_scope: rule.scope,
        p_bucket_key: bucket,
        p_window_seconds: rule.windowSeconds,
      });

      if (error || typeof count !== "number") {
        console.error("[rate-limit] RPC non disponibile, limite saltato:", error?.message ?? count);
        return { allowed: true };
      }
      if (count > rule.limit) retryAfterSeconds = Math.max(retryAfterSeconds, rule.windowSeconds);
    }

    return retryAfterSeconds > 0 ? { allowed: false, retryAfterSeconds } : { allowed: true };
  } catch (err) {
    console.error("[rate-limit] errore inatteso, limite saltato:", err);
    return { allowed: true };
  }
}

export const TOO_MANY_REQUESTS_MESSAGE =
  "Hai inviato troppe richieste in poco tempo. Riprova tra qualche minuto.";
