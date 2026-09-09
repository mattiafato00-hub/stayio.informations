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

type Status = "idle" | "sending" | "sent" | "error";

const iconWhatsapp = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.8 5-1.3A10 10 0 1 0 12 2Zm5.8 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5.1-4.5-.1-.2-1.2-1.5-1.2-2.9 0-1.4.7-2 1-2.3.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.1.3.7 1.1 1.5 1.8 1 .9 1.8 1.1 2.1 1.3.3.1.5.1.6-.1l.7-.9c.2-.2.4-.2.6-.1l1.9.9c.2.1.4.2.4.3.1.2.1.8-.1 1.4Z" />
  </svg>
);
const iconEdit = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
  </svg>
);

export default function HostPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ editToken?: string; suggestedSlug?: string } | null>(null);
  // Base URL del concierge: in produzione si può forzare con NEXT_PUBLIC_SITE_URL,
  // altrimenti si usa l'origin corrente (localhost in locale, dominio reale in prod).
  const [siteUrl] = useState(() => {
    const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
    if (configured) return configured;
    return typeof window !== "undefined" ? window.location.origin : "";
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");

    const data = new FormData(event.currentTarget);
    const phone = data.get("phone");
    const payload = {
      name: data.get("name"),
      email: data.get("email"),
      // un solo campo di contatto: lo salviamo sia come telefono che come WhatsApp
      host_phone: phone,
      host_whatsapp: phone,
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

  const editPath = result?.editToken ? `/il-mio-concierge/${result.editToken}` : null;
  const editUrl = editPath && siteUrl ? `${siteUrl}${editPath}` : null;
  const siteHost = siteUrl.replace(/^https?:\/\//, "");
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(
    editUrl
      ? `Il mio concierge digitale Stayio. Link personale per aggiungere e modificare le info: ${editUrl}`
      : "Il mio concierge digitale Stayio.",
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
            <span className="dot" /> Gratis · 30 secondi
          </p>
          <h2>Attiva il tuo concierge</h2>
          <p>Ci servono solo tre cose per crearlo. I dettagli li aggiungi dopo, con calma.</p>
        </div>

        {status === "sent" ? (
          <div className="r-success" role="status">
            <span className="r-success-mark" aria-hidden="true">✓</span>
            <h3>Il tuo concierge è già attivo.</h3>
            <p>
              Quando hai qualche minuto, torna sul tuo link personale per aggiungere Wi-Fi, regole
              della casa e tutte le altre informazioni utili ai tuoi ospiti.
            </p>

            <div className="h-success-actions">
              {editPath && (
                <a className="h-edit-cta" href={editPath}>
                  {iconEdit} Aggiungi i dettagli ora
                </a>
              )}
              <a className="h-wa" href={whatsappHref} target="_blank" rel="noopener noreferrer">
                {iconWhatsapp} Salva il link su WhatsApp
              </a>
            </div>

            {editUrl && (
              <p className="h-success-link">
                Il tuo link personale (salvalo): <code>{editUrl}</code>
              </p>
            )}
            {result?.suggestedSlug && (
              <p className="h-success-slug">
                Indirizzo del concierge: <code>{siteHost ? `${siteHost}/` : ""}{result.suggestedSlug}</code>
              </p>
            )}
          </div>
        ) : (
          <>
            <p className="h-form-note">Bastano 30 secondi — potrai aggiungere tutti i dettagli quando vuoi.</p>
            <form className="r-form" onSubmit={handleSubmit}>
              <div className="r-field r-field-full">
                <label htmlFor="name">Nome dell&apos;alloggio *</label>
                <input id="name" name="name" type="text" required autoComplete="organization" />
              </div>
              <div className="r-field">
                <label htmlFor="email">Email *</label>
                <input id="email" name="email" type="email" required autoComplete="email" />
              </div>
              <div className="r-field">
                <label htmlFor="phone">Telefono / WhatsApp *</label>
                <input id="phone" name="phone" type="tel" required autoComplete="tel" />
              </div>

              {status === "error" && <p className="r-form-error">{error}</p>}

              <button type="submit" className="r-submit" disabled={status === "sending"}>
                {status === "sending" ? "Attivazione in corso…" : "Attiva il concierge gratuito"}
              </button>
            </form>
          </>
        )}
      </section>

      <footer className="footer">
        <Image src="/stayio-logo.png" alt="Stayio" width={90} height={29} style={{ width: "90px", height: "auto" }} />
        <span>© 2026 Stayio</span>
      </footer>
    </main>
  );
}
