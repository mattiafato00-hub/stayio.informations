// Ristoranti partner che l'host può consigliare ai propri ospiti
// (tabella property_recommended_restaurants, CHECK sort_order 0..2).
// Nessun import: il modulo è testato direttamente con `node --test`.

export const MAX_RECOMMENDED_RESTAURANTS = 3;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Normalizza `recommendedRestaurantIds` dal body della richiesta.
 * - `null` se il campo non è un array (campo assente → non si tocca nulla);
 * - scarta in silenzio i valori non-uuid e i duplicati (come le FAQ
 *   incomplete), mantenendo l'ordine della prima occorrenza.
 * Il limite massimo NON è applicato qui: lo verifica il chiamante, così
 * può rispondere con un errore esplicito.
 */
export function sanitizeRecommendedIds(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const raw of value) {
    if (typeof raw !== "string") continue;
    const id = raw.trim().toLowerCase();
    if (!UUID_RE.test(id) || seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }
  return ids;
}

/** Tiene solo gli id presenti nel catalogo attivo (public_restaurants), in ordine. */
export function keepActiveIds(ids: string[], activeIds: Iterable<string>): string[] {
  const active = new Set(Array.from(activeIds, (id) => id.toLowerCase()));
  return ids.filter((id) => active.has(id));
}
