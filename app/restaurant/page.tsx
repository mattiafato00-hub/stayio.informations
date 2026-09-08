"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80";

const benefits = [
  {
    title: "Visibilità diretta",
    text: "Ti mostriamo a turisti e visitatori già in zona, mentre decidono dove mangiare.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 21s-7-5.3-7-11a7 7 0 0 1 14 0c0 5.7-7 11-7 11Z" />
        <circle cx="12" cy="10" r="2.6" />
      </svg>
    ),
  },
  {
    title: "Zero pubblicità dispersiva",
    text: "Niente budget bruciato su annunci generici: raggiungi solo chi è davvero vicino a te.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="0.8" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Pacchetti su misura",
    text: "Trattoria, fine dining, pizzeria o bistrot: c'è una formula pensata per la tua attività.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 8.5 12 4l9 4.5-9 4.5-9-4.5Z" />
        <path d="M3 8.5V16l9 4.5 9-4.5V8.5" />
        <path d="M12 13v7.5" />
      </svg>
    ),
  },
];

type Status = "idle" | "sending" | "sent" | "error";

export default function RestaurantPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");

    const data = new FormData(event.currentTarget);
    const payload = {
      role: "Ristoratore",
      venueName: data.get("venueName"),
      city: data.get("city"),
      name: data.get("name"),
      email: data.get("email"),
      phone: data.get("phone"),
      seats: data.get("seats"),
      message: data.get("message"),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setStatus("sent");
        return;
      }

      const result = await response.json().catch(() => null);
      setError(result?.error || "Non siamo riusciti a inviare la richiesta. Riprova.");
      setStatus("error");
    } catch {
      setError("Non siamo riusciti a inviare la richiesta. Riprova.");
      setStatus("error");
    }
  }

  return (
    <main className="landing restaurant">
      <nav className="nav">
        <Link href="/">
          <Image src="/stayio-logo.png" alt="Stayio" width={325} height={104} style={{ width: "325px", height: "auto" }} priority />
        </Link>
      </nav>

      <section className="r-hero">
        <div className="r-hero-copy">
          <p className="eyebrow">
            <span className="dot" /> Per i ristoranti
          </p>
          <h1>Nuovi clienti, proprio quando sono pronti a scegliere.</h1>
          <p className="intro">Chi ospita ti apre la porta. Chi arriva, si siede al tuo tavolo.</p>
          <a href="#richiedi" className="r-cta">
            Richiedi informazioni <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="r-hero-media" style={{ backgroundImage: `url(${HERO_IMAGE})` }}>
          <div className="r-hero-badge">
            <span className="r-hero-badge-pulse" aria-hidden="true" />
            <div>
              <strong>Ospiti in arrivo</strong>
              <span>dalle strutture qui vicino</span>
            </div>
          </div>
        </div>
      </section>

      <section className="r-benefits" aria-label="Perché Stayio">
        {benefits.map((benefit) => (
          <article className="r-benefit" key={benefit.title}>
            <span className="r-benefit-icon">{benefit.icon}</span>
            <h3>{benefit.title}</h3>
            <p>{benefit.text}</p>
          </article>
        ))}
      </section>

      <section className="r-form-section" id="richiedi">
        <div className="r-form-intro">
          <p className="eyebrow">
            <span className="dot" /> Meno di un minuto
          </p>
          <h2>Raccontaci del tuo locale</h2>
          <p>Ti ricontattiamo con il pacchetto giusto per la tua attività. Nessun impegno.</p>
        </div>

        {status === "sent" ? (
          <div className="r-success" role="status">
            <span className="r-success-mark" aria-hidden="true">✓</span>
            <h3>Grazie! Ti ricontatteremo presto.</h3>
            <p>Abbiamo ricevuto la tua richiesta.</p>
          </div>
        ) : (
          <form className="r-form" onSubmit={handleSubmit}>
            <div className="r-field">
              <label htmlFor="venueName">Nome del locale *</label>
              <input id="venueName" name="venueName" type="text" required autoComplete="organization" />
            </div>

            <div className="r-field">
              <label htmlFor="city">Città / zona *</label>
              <input id="city" name="city" type="text" required autoComplete="address-level2" />
            </div>

            <div className="r-field">
              <label htmlFor="name">Nome e cognome del referente *</label>
              <input id="name" name="name" type="text" required autoComplete="name" />
            </div>

            <div className="r-field">
              <label htmlFor="email">Email *</label>
              <input id="email" name="email" type="email" required autoComplete="email" />
            </div>

            <div className="r-field">
              <label htmlFor="phone">Telefono</label>
              <input id="phone" name="phone" type="tel" autoComplete="tel" />
            </div>

            <div className="r-field">
              <label htmlFor="seats">Numero di coperti</label>
              <input id="seats" name="seats" type="number" min={0} inputMode="numeric" />
            </div>

            <div className="r-field r-field-full">
              <label htmlFor="message">Messaggio (facoltativo)</label>
              <textarea id="message" name="message" rows={4} />
            </div>

            {status === "error" && <p className="r-form-error">{error}</p>}

            <button type="submit" className="r-submit" disabled={status === "sending"}>
              {status === "sending" ? "Invio in corso…" : "Invia richiesta"}
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
