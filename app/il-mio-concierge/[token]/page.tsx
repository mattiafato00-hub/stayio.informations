import type { Metadata } from "next";

import { getSupabaseAdmin } from "@/lib/supabase-admin";

import EditConciergeForm, { type ConciergeProperty, type FaqRow, type RestaurantOption } from "./EditConciergeForm";

export const dynamic = "force-dynamic";

// Pagina privata (possesso del link = accesso): mai indicizzata. Anche
// l'header X-Robots-Tag in next.config.ts copre questo percorso.
export const metadata: Metadata = {
  title: "Il tuo concierge | Stayio",
  robots: { index: false, follow: false, nocache: true },
  openGraph: null,
  twitter: null,
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function loadProperty(
  token: string,
): Promise<{
  property: ConciergeProperty;
  faqs: FaqRow[];
  restaurants: RestaurantOption[];
  recommendedIds: string[];
  guideVisits30d: number;
  hasNfcTag: boolean;
} | null> {
  if (!UUID_RE.test(token)) return null;

  const supabase = getSupabaseAdmin();

  const { data: property, error } = await supabase
    .from("property_details")
    .select(
      "id, name, address, wifi_ssid, wifi_password, checkin_info, checkout_info, access_instructions, house_rules, parking_info, waste_info, luggage_info, appliances_info, climate_info, host_phone, host_whatsapp, custom_instructions, suggested_slug, nfc_source_id",
    )
    .eq("edit_token", token)
    .maybeSingle();

  if (error || !property) return null;

  const { data: faqs } = await supabase
    .from("property_faqs")
    .select("question, answer, sort_order")
    .eq("property_id", property.id)
    .order("sort_order", { ascending: true });

  // Catalogo dei ristoranti partner attivi (vista: solo active, non demo)
  // + quelli già consigliati dall'host, per pre-selezionarli.
  const [{ data: restaurants }, { data: recommended }] = await Promise.all([
    supabase
      .from("public_restaurants")
      .select("id, name, address, price_range")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("property_recommended_restaurants")
      .select("activity_id")
      .eq("property_id", property.id)
      .order("sort_order", { ascending: true }),
  ]);

  // Stesso dato mostrato nel dashboard con login (guide_visits) — qui
  // niente RLS da rispettare: il service role vede tutto, l'identità la
  // dà il possesso del token, non una sessione.
  let guideVisits30d = 0;
  if (property.nfc_source_id) {
    const { data: source } = await supabase
      .from("nfc_sources")
      .select("code")
      .eq("id", property.nfc_source_id)
      .maybeSingle();

    if (source?.code) {
      const since = new Date();
      since.setDate(since.getDate() - 30);
      const { count } = await supabase
        .from("guide_visits")
        .select("id", { count: "exact", head: true })
        .eq("source_code", source.code)
        .gte("created_at", since.toISOString());
      guideVisits30d = count ?? 0;
    }
  }

  return {
    property: property as ConciergeProperty,
    faqs: (faqs ?? []).map((f) => ({ question: f.question ?? "", answer: f.answer ?? "" })),
    restaurants: (restaurants ?? []) as RestaurantOption[],
    recommendedIds: (recommended ?? []).map((r) => r.activity_id as string),
    guideVisits30d,
    hasNfcTag: Boolean(property.nfc_source_id),
  };
}

export default async function EditConciergePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await loadProperty(token);

  return (
    <main className="host">
      {data ? (
        <>
          <header className="h-edit-head">
            <p className="eyebrow">
              <span className="dot" /> Il tuo concierge
            </p>
            <h1>{data.property.name || "Il tuo concierge"}</h1>
            <p>Aggiungi o modifica le informazioni che i tuoi ospiti vedranno. Salva quando vuoi, anche un pezzo alla volta.</p>
          </header>

          {data.hasNfcTag && (
            <div className="h-stats">
              <span className="h-stats-value">{data.guideVisits30d}</span>
              <span className="h-stats-label">
                {data.guideVisits30d === 1 ? "persona ha toccato" : "persone hanno toccato"} il tuo tag NFC negli
                ultimi 30 giorni
              </span>
            </div>
          )}

          <section className="r-form-section">
            <EditConciergeForm
              token={token}
              property={data.property}
              faqs={data.faqs}
              restaurants={data.restaurants}
              recommendedIds={data.recommendedIds}
            />
          </section>
        </>
      ) : (
        <section className="r-form-section">
          <div className="r-success" role="status">
            <h3>Link non valido</h3>
            <p>
              Questo link personale non è più valido o non è corretto. Controlla di aver aperto il link
              completo che hai ricevuto, oppure scrivici e te lo rimandiamo.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
