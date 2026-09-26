import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Client Supabase con service role, solo lato server. Creato alla prima
// richiesta, non a livello di modulo: `next build` importa le route per
// raccoglierne la configurazione, e un createClient() al top-level con
// le variabili assenti faceva fallire la build ("supabaseUrl is
// required"). Così una variabile mancante diventa un errore a runtime,
// loggato e trasformato in 500 dal chiamante, non un errore di build.

let client: SupabaseClient | null = null;

export class MissingEnvError extends Error {
  constructor(names: string[]) {
    super(`Variabili d'ambiente mancanti: ${names.join(", ")}`);
    this.name = "MissingEnvError";
  }
}

export function getSupabaseAdmin(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const missing = [
    !url && "NEXT_PUBLIC_SUPABASE_URL",
    !serviceRoleKey && "SUPABASE_SERVICE_ROLE_KEY",
  ].filter((name): name is string => Boolean(name));
  if (missing.length > 0) throw new MissingEnvError(missing);

  client = createClient(url!, serviceRoleKey!, { auth: { persistSession: false } });
  return client;
}
