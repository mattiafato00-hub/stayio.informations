"use client";

import { FormEvent, ReactNode, useId, useState } from "react";

import PrivacyNote from "@/components/PrivacyNote";
import { MAX_RECOMMENDED_RESTAURANTS } from "@/lib/recommended-restaurants";
import { FAQ_LIMITS, PROPERTY_FIELD_LIMITS as LIMITS } from "@/lib/validation";

export type ConciergeProperty = {
  id: string;
  name: string | null;
  address: string | null;
  wifi_ssid: string | null;
  wifi_password: string | null;
  checkin_info: string | null;
  checkout_info: string | null;
  access_instructions: string | null;
  house_rules: string | null;
  parking_info: string | null;
  waste_info: string | null;
  luggage_info: string | null;
  appliances_info: string | null;
  climate_info: string | null;
  host_phone: string | null;
  host_whatsapp: string | null;
  custom_instructions: string | null;
  suggested_slug: string | null;
};

export type FaqRow = { question: string; answer: string };

export type RestaurantOption = {
  id: string;
  name: string | null;
  address: string | null;
  price_range: string | null;
};

type Status = "idle" | "saving" | "saved" | "error";

const iconStructure = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5M9 10h.01M15 10h.01M9 13h.01M15 13h.01" />
  </svg>
);
const iconWifi = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12.55a11 11 0 0 1 14 0M1.5 8.5a16 16 0 0 1 21 0M8.5 16.4a6 6 0 0 1 7 0M12 20h.01" />
  </svg>
);
const iconKey = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 7a4 4 0 1 1-4.9 3.9L4 17v3h3l1-1h2l1-1v-2l1.1-1.1A4 4 0 0 1 15 7Z" />
    <path d="M16.5 7.5h.01" />
  </svg>
);
const iconHouse = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5" />
  </svg>
);
const iconPhone = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
  </svg>
);
const iconNote = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 4h16v12l-4 4H4V4Z" />
    <path d="M14 20v-4h4M8 9h8M8 13h5" />
  </svg>
);
const iconFaq = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.5a2.5 2.5 0 0 1 4.8.9c0 1.7-2.3 2.1-2.3 3.6M12 17h.01" />
  </svg>
);
const iconCar = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13m-14 0h14m-14 0v4m14-4v4M7 17h.01M17 17h.01M5 17h14v.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 17.5V17Z" />
  </svg>
);
const iconFork = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 3v8M4.5 3v5a2.5 2.5 0 0 0 5 0V3M7 11v10M17 21V3c-2.2 1.2-3.5 3.6-3.5 7v3H17" />
  </svg>
);
const iconTrash = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M10 11v6M14 11v6" />
  </svg>
);
const iconChevron = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const hasValue = (v: string | null | undefined) => typeof v === "string" && v.trim().length > 0;

/**
 * Selettore dei ristoranti partner consigliati dall'host: checkbox con
 * contatore, oltre il limite le voci non scelte vengono disabilitate
 * (mai selezionate e poi bloccate). Le checkbox non hanno `name`: gli id
 * viaggiano nel payload dallo stato React, come le FAQ.
 */
function RestaurantPicker({
  restaurants,
  selected,
  onToggle,
}: {
  restaurants: RestaurantOption[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  const [limitHit, setLimitHit] = useState(false);
  const full = selected.length >= MAX_RECOMMENDED_RESTAURANTS;

  if (restaurants.length === 0) {
    return (
      <p className="h-rest-empty" role="status">
        Al momento non ci sono ristoranti partner attivi da consigliare. Appena ne aggiungiamo, li troverai qui.
      </p>
    );
  }

  return (
    <>
      <p className={`h-rest-count${full ? " is-full" : ""}`} aria-live="polite">
        {selected.length}/{MAX_RECOMMENDED_RESTAURANTS} selezionati
      </p>
      <ul className="h-rest-list">
        {restaurants.map((r) => {
          const checked = selected.includes(r.id);
          const disabled = !checked && full;
          return (
            <li key={r.id}>
              <label
                className={`h-rest-item${checked ? " is-checked" : ""}${disabled ? " is-disabled" : ""}`}
                onClick={() => disabled && setLimitHit(true)}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => {
                    setLimitHit(false);
                    onToggle(r.id);
                  }}
                />
                <span className="h-rest-text">
                  <span className="h-rest-name">
                    {r.name || "Ristorante"}
                    {r.price_range && <span className="h-rest-price"> · {r.price_range}</span>}
                  </span>
                  {r.address && <span className="h-rest-address">{r.address}</span>}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      {full && (
        <p className={`h-rest-limit${limitHit ? " is-alert" : ""}`} role={limitHit ? "alert" : undefined}>
          Hai già scelto {MAX_RECOMMENDED_RESTAURANTS} ristoranti, il massimo. Per sceglierne un altro, togline prima uno.
        </p>
      )}
    </>
  );
}

/**
 * Sezione collassabile del form di modifica. I campi restano SEMPRE
 * montati nel DOM (anche da chiusi): vengono solo nascosti via `hidden`,
 * così `new FormData(form)` continua a inviarli al salvataggio.
 *
 * `filled` = la sezione ha già almeno un dato compilato → parte aperta
 * e mostra un pallino verde, così chi torna a modificare non deve
 * riaprire tutto.
 */
function AccordionSection({
  icon,
  title,
  filled,
  children,
}: {
  icon: ReactNode;
  title: string;
  filled: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(filled);
  const bodyId = useId();

  return (
    <div className={`h-fieldset h-acc${open ? " is-open" : ""}`}>
      <button
        type="button"
        className="h-acc-header"
        aria-expanded={open}
        aria-controls={bodyId}
        aria-label={filled ? `${title} — sezione già compilata` : title}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="h-acc-ico" aria-hidden="true">
          {icon}
        </span>
        <span className="h-acc-title">{title}</span>
        {filled && <span className="h-acc-dot" title="Sezione già compilata" aria-hidden="true" />}
        <span className="h-acc-chevron" aria-hidden="true">
          {iconChevron}
        </span>
      </button>
      <div id={bodyId} className="h-acc-body" hidden={!open}>
        {children}
      </div>
    </div>
  );
}

export default function EditConciergeForm({
  token,
  property,
  faqs: initialFaqs,
  restaurants,
  recommendedIds,
}: {
  token: string;
  property: ConciergeProperty;
  faqs: FaqRow[];
  restaurants: RestaurantOption[];
  recommendedIds: string[];
}) {
  // Pre-selezione: solo i consigliati ancora presenti nel catalogo attivo.
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>(() =>
    recommendedIds.filter((id) => restaurants.some((r) => r.id === id)).slice(0, MAX_RECOMMENDED_RESTAURANTS),
  );
  const [faqs, setFaqs] = useState<FaqRow[]>(initialFaqs.length > 0 ? initialFaqs : [{ question: "", answer: "" }]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  function addFaq() {
    setFaqs((rows) => (rows.length >= FAQ_LIMITS.maxItems ? rows : [...rows, { question: "", answer: "" }]));
  }

  function removeFaq(index: number) {
    setFaqs((rows) => (rows.length === 1 ? [{ question: "", answer: "" }] : rows.filter((_, i) => i !== index)));
  }

  function updateFaq(index: number, key: keyof FaqRow, value: string) {
    setFaqs((rows) => rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  }

  function toggleRestaurant(id: string) {
    setSelectedRestaurants((ids) => {
      if (ids.includes(id)) return ids.filter((x) => x !== id);
      return ids.length >= MAX_RECOMMENDED_RESTAURANTS ? ids : [...ids, id];
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setError("");

    const data = new FormData(event.currentTarget);
    const payload = {
      token,
      name: data.get("name"),
      wifi_ssid: data.get("wifi_ssid"),
      wifi_password: data.get("wifi_password"),
      checkin_info: data.get("checkin_info"),
      checkout_info: data.get("checkout_info"),
      access_instructions: data.get("access_instructions"),
      house_rules: data.get("house_rules"),
      parking_info: data.get("parking_info"),
      waste_info: data.get("waste_info"),
      luggage_info: data.get("luggage_info"),
      appliances_info: data.get("appliances_info"),
      climate_info: data.get("climate_info"),
      host_phone: data.get("host_phone"),
      host_whatsapp: data.get("host_whatsapp"),
      custom_instructions: data.get("custom_instructions"),
      faqs: faqs.filter((f) => f.question.trim() && f.answer.trim()),
      recommendedRestaurantIds: selectedRestaurants,
    };

    try {
      const response = await fetch("/api/host-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await response.json().catch(() => null);

      if (response.ok && json?.success) {
        setStatus("saved");
        return;
      }

      setError(json?.error || "Errore nel salvataggio. Riprova.");
      setStatus("error");
    } catch {
      setError("Errore nel salvataggio. Riprova.");
      setStatus("error");
    }
  }

  return (
    <form className="h-form" onSubmit={handleSubmit} onChange={() => status === "saved" && setStatus("idle")}>
      <fieldset className="h-fieldset">
        <legend className="h-legend">{iconStructure} La struttura</legend>
        <div className="h-grid">
          <div className="r-field r-field-full">
            <label htmlFor="name">Nome dell&apos;alloggio *</label>
            <input id="name" name="name" maxLength={LIMITS.name} type="text" required defaultValue={property.name ?? ""} autoComplete="organization" />
          </div>
        </div>
      </fieldset>

      <AccordionSection icon={iconWifi} title="Wi-Fi" filled={hasValue(property.wifi_ssid) || hasValue(property.wifi_password)}>
        <div className="h-grid">
          <div className="r-field">
            <label htmlFor="wifi_ssid">Nome rete (SSID)</label>
            <input id="wifi_ssid" name="wifi_ssid" maxLength={LIMITS.wifi_ssid} type="text" defaultValue={property.wifi_ssid ?? ""} />
          </div>
          <div className="r-field">
            <label htmlFor="wifi_password">Password</label>
            <input id="wifi_password" name="wifi_password" maxLength={LIMITS.wifi_password} type="text" defaultValue={property.wifi_password ?? ""} />
          </div>
        </div>
      </AccordionSection>

      <AccordionSection
        icon={iconKey}
        title="Arrivo e partenza"
        filled={hasValue(property.checkin_info) || hasValue(property.checkout_info) || hasValue(property.access_instructions)}
      >
        <p className="h-hint">
          Gli orari di check-in e check-out li mostriamo già noi: qui scrivi solo la <strong>procedura</strong> —
          a chi citofonare, dove sono le chiavi, cosa fare prima di uscire.
        </p>
        <div className="h-grid">
          <div className="r-field">
            <label htmlFor="checkin_info">Come fare il check-in</label>
            <textarea id="checkin_info" name="checkin_info" maxLength={LIMITS.checkin_info} rows={2} defaultValue={property.checkin_info ?? ""} placeholder="Es. citofona a 'Rossi', 2º piano. Le chiavi sono nella cassetta accanto al portone, codice 4471." />
          </div>
          <div className="r-field">
            <label htmlFor="checkout_info">Cosa fare prima di uscire</label>
            <textarea id="checkout_info" name="checkout_info" maxLength={LIMITS.checkout_info} rows={2} defaultValue={property.checkout_info ?? ""} placeholder="Es. lascia le chiavi sul tavolo, spegni il climatizzatore, chiudi bene la porta-finestra." />
          </div>
          <div className="r-field r-field-full">
            <label htmlFor="access_instructions">Come si accede</label>
            <textarea id="access_instructions" name="access_instructions" maxLength={LIMITS.access_instructions} rows={2} defaultValue={property.access_instructions ?? ""} placeholder="Portone, scale, ascensore, codice della cassetta..." />
          </div>
        </div>
      </AccordionSection>

      <AccordionSection
        icon={iconHouse}
        title="La casa"
        filled={
          hasValue(property.house_rules) ||
          hasValue(property.luggage_info) ||
          hasValue(property.appliances_info) ||
          hasValue(property.climate_info)
        }
      >
        <p className="h-hint">
          Non le regole generiche (quelle le diamo per scontate): le <strong>particolarità</strong> che solo tu conosci.
        </p>
        <div className="h-grid">
          <div className="r-field r-field-full">
            <label htmlFor="house_rules">Particolarità e regole della casa</label>
            <textarea id="house_rules" name="house_rules" maxLength={LIMITS.house_rules} rows={2} defaultValue={property.house_rules ?? ""} placeholder="Es. la porta-finestra va sempre chiusa a chiave, niente lavatrice dopo le 22 per i vicini, il balcone del 3º piano non si usa." />
          </div>
          <div className="r-field">
            <label htmlFor="luggage_info">Deposito bagagli</label>
            <textarea id="luggage_info" name="luggage_info" maxLength={LIMITS.luggage_info} rows={2} defaultValue={property.luggage_info ?? ""} placeholder="Es. puoi lasciare le valigie in ingresso prima del check-in o dopo il check-out, avvisami e ti apro." />
          </div>
          <div className="r-field">
            <label htmlFor="appliances_info">Elettrodomestici</label>
            <textarea id="appliances_info" name="appliances_info" maxLength={LIMITS.appliances_info} rows={2} defaultValue={property.appliances_info ?? ""} placeholder="Solo quelli con qualche particolarità: es. la lavatrice parte solo col rubinetto aperto sotto il lavello." />
          </div>
          <div className="r-field">
            <label htmlFor="climate_info">Riscaldamento / aria condizionata</label>
            <textarea id="climate_info" name="climate_info" maxLength={LIMITS.climate_info} rows={2} defaultValue={property.climate_info ?? ""} placeholder="Es. telecomando nel primo cassetto, tasto in alto per accendere; il termostato in corridoio si gira in senso orario." />
          </div>
        </div>
      </AccordionSection>

      <AccordionSection icon={iconCar} title="Parcheggio" filled={hasValue(property.parking_info)}>
        <p className="h-hint">Il consiglio pratico che daresti tu di persona, non solo &laquo;c&apos;è un parcheggio&raquo;.</p>
        <div className="h-grid">
          <div className="r-field r-field-full">
            <label htmlFor="parking_info">Dove parcheggiare l&apos;auto</label>
            <textarea id="parking_info" name="parking_info" maxLength={LIMITS.parking_info} rows={2} defaultValue={property.parking_info ?? ""} placeholder="Es. strisce blu gratuite dopo le 20 e la domenica; il posto sotto casa in Via Roma 4 è quasi sempre libero; il garage in cortile ha il telecomando appeso all&apos;ingresso." />
          </div>
        </div>
      </AccordionSection>

      <AccordionSection icon={iconTrash} title="Spazzatura e raccolta differenziata" filled={hasValue(property.waste_info)}>
        <p className="h-hint">Com&apos;è organizzata dalle tue parti: cambia da via a via, l&apos;ospite non può saperlo.</p>
        <div className="h-grid">
          <div className="r-field r-field-full">
            <label htmlFor="waste_info">Come e dove si buttano i rifiuti</label>
            <textarea id="waste_info" name="waste_info" maxLength={LIMITS.waste_info} rows={2} defaultValue={property.waste_info ?? ""} placeholder="Es. i bidoni sono in cortile; umido lunedì e giovedì, plastica il mercoledì, sacchetti sotto il lavello; il vetro nella campana all&apos;angolo." />
          </div>
        </div>
      </AccordionSection>

      <AccordionSection icon={iconFork} title="Ristoranti che consigli" filled={selectedRestaurants.length > 0}>
        <p className="h-hint">
          Scegli fino a {MAX_RECOMMENDED_RESTAURANTS} ristoranti partner di Stayio da consigliare ai tuoi ospiti: li vedranno come
          tuoi suggerimenti personali.
        </p>
        <RestaurantPicker restaurants={restaurants} selected={selectedRestaurants} onToggle={toggleRestaurant} />
      </AccordionSection>

      <AccordionSection
        icon={iconPhone}
        title="Contatti"
        filled={hasValue(property.host_phone) || hasValue(property.host_whatsapp)}
      >
        <p className="h-hint">Li usiamo solo noi per contattarti: non vengono mostrati agli ospiti.</p>
        <div className="h-grid">
          <div className="r-field">
            <label htmlFor="host_phone">Telefono</label>
            <input id="host_phone" name="host_phone" maxLength={LIMITS.host_phone} type="tel" defaultValue={property.host_phone ?? ""} autoComplete="tel" />
          </div>
          <div className="r-field">
            <label htmlFor="host_whatsapp">WhatsApp</label>
            <input id="host_whatsapp" name="host_whatsapp" maxLength={LIMITS.host_whatsapp} type="tel" defaultValue={property.host_whatsapp ?? ""} />
          </div>
        </div>
      </AccordionSection>

      <AccordionSection icon={iconNote} title="Note aggiuntive" filled={hasValue(property.custom_instructions)}>
        <div className="h-grid">
          <div className="r-field r-field-full">
            <label htmlFor="custom_instructions">Qualsiasi altra cosa utile ai tuoi ospiti</label>
            <textarea id="custom_instructions" name="custom_instructions" maxLength={LIMITS.custom_instructions} rows={3} defaultValue={property.custom_instructions ?? ""} />
          </div>
        </div>
      </AccordionSection>

      <fieldset className="h-fieldset">
        <legend className="h-legend">{iconFaq} Domande frequenti</legend>
        <p className="h-hint">Le domande che ti fanno più spesso, con la risposta pronta. Fino a {FAQ_LIMITS.maxItems}.</p>
        {faqs.map((faq, index) => (
          <div className="h-faq-row" key={index}>
            <div className="h-faq-top">
              <span>Domanda {index + 1}</span>
              <button type="button" className="h-faq-remove" onClick={() => removeFaq(index)}>
                Rimuovi
              </button>
            </div>
            <div className="r-field">
              <label htmlFor={`faq-q-${index}`}>Domanda</label>
              <input
                id={`faq-q-${index}`}
                type="text"
                value={faq.question}
                maxLength={FAQ_LIMITS.question}
                onChange={(e) => updateFaq(index, "question", e.target.value)}
                placeholder="Es. C'è il phon in bagno?"
              />
            </div>
            <div className="r-field">
              <label htmlFor={`faq-a-${index}`}>Risposta</label>
              <textarea
                id={`faq-a-${index}`}
                rows={2}
                value={faq.answer}
                maxLength={FAQ_LIMITS.answer}
                onChange={(e) => updateFaq(index, "answer", e.target.value)}
                placeholder="Es. Sì, nel primo cassetto sotto il lavandino."
              />
            </div>
          </div>
        ))}
        <button type="button" className="h-faq-add" onClick={addFaq} disabled={faqs.length >= FAQ_LIMITS.maxItems}>
          + Aggiungi domanda
        </button>
      </fieldset>

      {status === "error" && <p className="r-form-error">{error}</p>}

      <button type="submit" className="r-submit" disabled={status === "saving"}>
        {status === "saving" ? "Salvataggio…" : "Salva le informazioni"}
      </button>
      <PrivacyNote />

      {status === "saved" && <p className="h-edit-saved" role="status">Salvato ✓</p>}
    </form>
  );
}
