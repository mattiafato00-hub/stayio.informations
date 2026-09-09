import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";

import EditConciergeForm, { type ConciergeProperty, type FaqRow } from "./EditConciergeForm";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function loadProperty(token: string): Promise<{ property: ConciergeProperty; faqs: FaqRow[] } | null> {
  if (!UUID_RE.test(token)) return null;

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: property, error } = await supabase
    .from("property_details")
    .select(
      "id, name, address, wifi_ssid, wifi_password, checkin_info, checkout_info, access_instructions, house_rules, parking_info, luggage_info, appliances_info, climate_info, host_phone, host_whatsapp, custom_instructions, suggested_slug",
    )
    .eq("edit_token", token)
    .maybeSingle();

  if (error || !property) return null;

  const { data: faqs } = await supabase
    .from("property_faqs")
    .select("question, answer, sort_order")
    .eq("property_id", property.id)
    .order("sort_order", { ascending: true });

  return {
    property: property as ConciergeProperty,
    faqs: (faqs ?? []).map((f) => ({ question: f.question ?? "", answer: f.answer ?? "" })),
  };
}

export default async function EditConciergePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await loadProperty(token);

  return (
    <main className="landing host">
      <nav className="nav">
        <Link href="/">
          <Image src="/stayio-logo.png" alt="Stayio" width={325} height={104} style={{ width: "325px", height: "auto" }} priority />
        </Link>
      </nav>

      {data ? (
        <>
          <header className="h-edit-head">
            <p className="eyebrow">
              <span className="dot" /> Il tuo concierge
            </p>
            <h1>{data.property.name || "Il tuo concierge"}</h1>
            <p>Aggiungi o modifica le informazioni che i tuoi ospiti vedranno. Salva quando vuoi, anche un pezzo alla volta.</p>
          </header>

          <section className="r-form-section">
            <EditConciergeForm token={token} property={data.property} faqs={data.faqs} />
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

      <footer className="footer">
        <Image src="/stayio-logo.png" alt="Stayio" width={90} height={29} style={{ width: "90px", height: "auto" }} />
        <span>© 2026 Stayio</span>
      </footer>
    </main>
  );
}
