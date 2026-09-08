"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80";

const benefits = [
  {
    title: "Risponde al posto tuo",
    text: "Wi-Fi, orari, check-in, regole della casa: i tuoi ospiti trovano tutto da soli, a qualsiasi ora.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 20l1.4-4.2A8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5Z" />
        <path d="M8.5 12h.01M12 12h.01M15.5 12h.01" />
      </svg>
    ),
  },
  {
    title: "Pronto in pochi minuti",
    text: "Compili le informazioni una volta. Le aggiorni quando vuoi, senza installare niente.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M13 2 4.5 13.5H12l-1 8.5L19.5 10.5H12l1-8.5Z" />
      </svg>
    ),
  },
  {
    title: "Gratuito, per sempre",
    text: "Nessun costo, nessuna commissione. Un servizio in più per i tuoi ospiti, offerto da te.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 12v9H4v-9" />
        <path d="M2 7h20v5H2z" />
        <path d="M12 22V7" />
        <path d="M12 7S9.5 3 7 3 3.5 7 7 7h5Zm0 0s2.5-4 5-4 3.5 4 0 4h-5Z" />
      </svg>
    ),
  },
];

const steps = [
  ["Racconti la tua struttura", "Un modulo semplice: compili quello che ti serve, salti il resto."],
  ["Ricevi il tuo concierge", "Lo portiamo noi nella tua struttura, pronto all'uso: i tuoi ospiti lo trovano da soli, senza che tu debba fare nulla."],
  ["Gli ospiti fanno da sé", "Meno messaggi per te, più autonomia per loro — dal primo giorno."],
];

type FaqRow = { question: string; answer: string };
type Status = "idle" | "sending" | "sent" | "error";

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
const iconWhatsapp = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.8 5-1.3A10 10 0 1 0 12 2Zm5.8 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5.1-4.5-.1-.2-1.2-1.5-1.2-2.9 0-1.4.7-2 1-2.3.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.1.3.7 1.1 1.5 1.8 1 .9 1.8 1.1 2.1 1.3.3.1.5.1.6-.1l.7-.9c.2-.2.4-.2.6-.1l1.9.9c.2.1.4.2.4.3.1.2.1.8-.1 1.4Z" />
  </svg>
);

export default function HostPage() {
  const [faqs, setFaqs] = useState<FaqRow[]>([{ question: "", answer: "" }]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ editToken?: string; suggestedSlug?: string } | null>(null);

  function addFaq() {
    setFaqs((rows) => [...rows, { question: "", answer: "" }]);
  }

  function removeFaq(index: number) {
    setFaqs((rows) => (rows.length === 1 ? [{ question: "", answer: "" }] : rows.filter((_, i) => i !== index)));
  }

  function updateFaq(index: number, key: keyof FaqRow, value: string) {
    setFaqs((rows) => rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");

    const data = new FormData(event.currentTarget);
    const payload = {
      name: data.get("name"),
      email: data.get("email"),
      address: data.get("address"),
      wifi_ssid: data.get("wifi_ssid"),
      wifi_password: data.get("wifi_password"),
      checkin_info: data.get("checkin_info"),
      checkout_info: data.get("checkout_info"),
      access_instructions: data.get("access_instructions"),
      house_rules: data.get("house_rules"),
      parking_info: data.get("parking_info"),
      luggage_info: data.get("luggage_info"),
      appliances_info: data.get("appliances_info"),
      climate_info: data.get("climate_info"),
      host_phone: data.get("host_phone"),
      host_whatsapp: data.get("host_whatsapp"),
      custom_instructions: data.get("custom_instructions"),
      faqs: faqs.filter((f) => f.question.trim() && f.answer.trim()),
    };

    try {
      const response = await fetch("/api/host-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await response.json().catch(() => null);

      if (response.ok && json?.success) {
        setResult({ editToken: json.editToken, suggestedSlug: json.suggestedSlug });
        setStatus("sent");
        return;
      }

      setError(json?.error || "Errore imprevisto. Riprova più tardi.");
      setStatus("error");
    } catch {
      setError("Errore imprevisto. Riprova più tardi.");
      setStatus("error");
    }
  }

  const conciergeUrl = result?.suggestedSlug ? `https://stayio.app/${result.suggestedSlug}` : "https://stayio.app";
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(
    `Il concierge digitale della mia struttura su Stayio 👉 ${conciergeUrl}`,
  )}`;

  return (
    <main className="landing host">
      <nav className="nav">
        <Link href="/">
          <Image src="/stayio-logo.png" alt="Stayio" width={325} height={104} style={{ width: "325px", height: "auto" }} priority />
        </Link>
      </nav>

      <section className="r-hero">
        <div className="r-hero-copy">
          <p className="eyebrow">
            <span className="dot" /> Per chi ospita
          </p>
          <h1>Il concierge digitale che risponde ai tuoi ospiti al posto tuo.</h1>
          <p className="intro">
            Wi-Fi, check-in, regole della casa, consigli sul quartiere: una pagina sempre aggiornata
            che i tuoi ospiti consultano da soli. Gratuita.
          </p>
          <a href="#registra" className="r-cta">
            Attiva il concierge gratuito <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="r-hero-media" style={{ backgroundImage: `url(${HERO_IMAGE})` }}>
          <div className="r-hero-badge">
            <span className="r-hero-badge-pulse" aria-hidden="true" />
            <div>
              <strong>Rispondo io agli ospiti</strong>
              <span>Wi-Fi, check-in, regole · 24/7</span>
            </div>
          </div>
        </div>
      </section>

      <section className="r-benefits" aria-label="Perché Stayio per gli host">
        {benefits.map((benefit) => (
          <article className="r-benefit" key={benefit.title}>
            <span className="r-benefit-icon">{benefit.icon}</span>
            <h3>{benefit.title}</h3>
            <p>{benefit.text}</p>
          </article>
        ))}
      </section>

      <section className="h-steps" aria-label="Come funziona">
        {steps.map(([title, text]) => (
          <div className="h-step" key={title}>
            <strong>{title}</strong>
            <span>{text}</span>
          </div>
        ))}
      </section>

      <section className="r-form-section" id="registra">
        <div className="r-form-intro">
          <p className="eyebrow">
            <span className="dot" /> Gratis · meno di 5 minuti
          </p>
          <h2>Crea il tuo concierge</h2>
          <p>Compila solo quello che vuoi mostrare ai tuoi ospiti. Potrai modificare tutto quando vuoi.</p>
        </div>

        {status === "sent" ? (
          <div className="r-success" role="status">
            <span className="r-success-mark" aria-hidden="true">✓</span>
            <h3>Grazie! Ti ricontatteremo presto.</h3>
            <p>Il tuo concierge digitale è stato creato. Ti scriviamo per gli ultimi dettagli e per portartelo pronto all&apos;uso nella tua struttura.</p>
            <a className="h-wa" href={whatsappHref} target="_blank" rel="noopener noreferrer">
              {iconWhatsapp} Salva il link su WhatsApp
            </a>
            {result?.suggestedSlug && (
              <p className="h-success-slug">
                Indirizzo suggerito: <code>stayio.app/{result.suggestedSlug}</code>
              </p>
            )}
          </div>
        ) : (
          <form className="h-form" onSubmit={handleSubmit}>
            <fieldset className="h-fieldset">
              <legend className="h-legend">{iconStructure} La struttura</legend>
              <div className="h-grid">
                <div className="r-field">
                  <label htmlFor="name">Nome della struttura *</label>
                  <input id="name" name="name" type="text" required autoComplete="organization" />
                </div>
                <div className="r-field">
                  <label htmlFor="address">Indirizzo</label>
                  <input id="address" name="address" type="text" autoComplete="street-address" />
                </div>
              </div>
            </fieldset>

            <fieldset className="h-fieldset">
              <legend className="h-legend">{iconWifi} Wi-Fi</legend>
              <div className="h-grid">
                <div className="r-field">
                  <label htmlFor="wifi_ssid">Nome rete (SSID)</label>
                  <input id="wifi_ssid" name="wifi_ssid" type="text" />
                </div>
                <div className="r-field">
                  <label htmlFor="wifi_password">Password</label>
                  <input id="wifi_password" name="wifi_password" type="text" />
                </div>
              </div>
            </fieldset>

            <fieldset className="h-fieldset">
              <legend className="h-legend">{iconKey} Arrivo e partenza</legend>
              <div className="h-grid">
                <div className="r-field">
                  <label htmlFor="checkin_info">Check-in</label>
                  <textarea id="checkin_info" name="checkin_info" rows={2} placeholder="Es. dalle 15:00, chiama al citofono 'Rossi'" />
                </div>
                <div className="r-field">
                  <label htmlFor="checkout_info">Check-out</label>
                  <textarea id="checkout_info" name="checkout_info" rows={2} placeholder="Es. entro le 10:00, lascia le chiavi sul tavolo" />
                </div>
                <div className="r-field r-field-full">
                  <label htmlFor="access_instructions">Come si accede</label>
                  <textarea id="access_instructions" name="access_instructions" rows={2} placeholder="Portone, scale, ascensore, codice della cassetta..." />
                </div>
              </div>
            </fieldset>

            <fieldset className="h-fieldset">
              <legend className="h-legend">{iconHouse} La casa</legend>
              <div className="h-grid">
                <div className="r-field r-field-full">
                  <label htmlFor="house_rules">Regole della casa</label>
                  <textarea id="house_rules" name="house_rules" rows={2} />
                </div>
                <div className="r-field">
                  <label htmlFor="parking_info">Parcheggio</label>
                  <textarea id="parking_info" name="parking_info" rows={2} />
                </div>
                <div className="r-field">
                  <label htmlFor="luggage_info">Deposito bagagli</label>
                  <textarea id="luggage_info" name="luggage_info" rows={2} />
                </div>
                <div className="r-field">
                  <label htmlFor="appliances_info">Elettrodomestici</label>
                  <textarea id="appliances_info" name="appliances_info" rows={2} placeholder="Lavatrice, forno, macchina del caffè..." />
                </div>
                <div className="r-field">
                  <label htmlFor="climate_info">Riscaldamento / aria condizionata</label>
                  <textarea id="climate_info" name="climate_info" rows={2} />
                </div>
              </div>
            </fieldset>

            <fieldset className="h-fieldset">
              <legend className="h-legend">{iconPhone} Contatti</legend>
              <p className="h-hint">Li usiamo solo noi per contattarti: non vengono mostrati agli ospiti.</p>
              <div className="h-grid">
                <div className="r-field r-field-full">
                  <label htmlFor="email">Email *</label>
                  <input id="email" name="email" type="email" required autoComplete="email" />
                </div>
                <div className="r-field">
                  <label htmlFor="host_phone">Telefono</label>
                  <input id="host_phone" name="host_phone" type="tel" autoComplete="tel" />
                </div>
                <div className="r-field">
                  <label htmlFor="host_whatsapp">WhatsApp</label>
                  <input id="host_whatsapp" name="host_whatsapp" type="tel" />
                </div>
              </div>
            </fieldset>

            <fieldset className="h-fieldset">
              <legend className="h-legend">{iconNote} Note aggiuntive</legend>
              <div className="h-grid">
                <div className="r-field r-field-full">
                  <label htmlFor="custom_instructions">Qualsiasi altra cosa utile ai tuoi ospiti</label>
                  <textarea id="custom_instructions" name="custom_instructions" rows={3} />
                </div>
              </div>
            </fieldset>

            <fieldset className="h-fieldset">
              <legend className="h-legend">{iconFaq} Domande frequenti</legend>
              <p className="h-hint">Le domande che ti fanno più spesso, con la risposta pronta. Aggiungine quante vuoi.</p>
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
                      onChange={(e) => updateFaq(index, "answer", e.target.value)}
                      placeholder="Es. Sì, nel primo cassetto sotto il lavandino."
                    />
                  </div>
                </div>
              ))}
              <button type="button" className="h-faq-add" onClick={addFaq}>
                + Aggiungi domanda
              </button>
            </fieldset>

            {status === "error" && <p className="r-form-error">{error}</p>}

            <button type="submit" className="r-submit" disabled={status === "sending"}>
              {status === "sending" ? "Creazione in corso…" : "Attiva il concierge gratuito"}
            </button>
          </form>
        )}
      </section>

      <footer className="footer">
        <Image src="/stayio-logo.png" alt="Stayio" width={90} height={29} style={{ width: "90px", height: "auto" }} />
        <span>© 2026 Stayio</span>
      </footer>
    </main>
  );
}
