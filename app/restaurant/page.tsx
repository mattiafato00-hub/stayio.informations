"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

import Honeypot from "@/components/Honeypot";
import PrivacyNote from "@/components/PrivacyNote";
import { HONEYPOT_FIELD } from "@/lib/antispam";
import { LEAD_FIELD_LIMITS, MAX_SEATS } from "@/lib/validation";

const HERO_IMAGE =
  "/images/restaurant-1200.webp";

// --- Percorso dell'ospite: dal check-in al tavolo del ristorante ---
// Nota: la parola "NFC" non compare mai in questo racconto — per il
// guest il meccanismo è "una guida curata", non una tecnologia.
const journeySteps = [
  {
    title: "Arriva in città",
    text: "Un ospite fa il check-in in un B&B o hotel partner Stayio — la sua serata inizia lì, non su Google.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 21V6a1 1 0 0 1 .76-.97L14 3v18" />
        <path d="M14 21h6V5l-6-2" />
        <circle cx="11" cy="12" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    title: "Riceve consigli su misura",
    text: "Durante il soggiorno scopre una selezione curata di esperienze e locali della zona, pensata apposta per lui.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="m14.5 9.5-1.6 4.4-4.4 1.6 1.6-4.4 4.4-1.6Z" />
      </svg>
    ),
  },
  {
    title: "Decide di uscire",
    text: "Arriva la sera, e con lei la domanda di sempre: dove si mangia stasera?",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.5 14.7A8.5 8.5 0 1 1 9.3 3.5a7 7 0 0 0 11.2 11.2Z" />
      </svg>
    ),
  },
  {
    title: "Ti trova tra i consigli",
    text: "Il tuo locale compare tra le esperienze suggerite, proprio nel momento in cui sta scegliendo dove andare.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 21s7-7.6 7-13a7 7 0 1 0-14 0c0 5.4 7 13 7 13Z" />
        <path d="m12 7.6.9 1.9 2.1.3-1.5 1.5.4 2.1-1.9-1-1.9 1 .4-2.1-1.5-1.5 2.1-.3.9-1.9Z" />
      </svg>
    ),
  },
  {
    title: "Viene da te",
    text: "Si siede al tuo tavolo. Da consiglio digitale a cliente vero, in una sera.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12.5 2.5 2.5 5-5.5" />
      </svg>
    ),
  },
];

/**
 * Sezione "come arrivano davvero i clienti": timeline verticale con
 * comparsa a scroll (IntersectionObserver, un flag per step) + puntini
 * che "camminano" lungo la linea in loop continuo, per comunicare un
 * flusso reale di persone e non un semplice elenco statico.
 */
function GuestJourneyFlow() {
  const [visible, setVisible] = useState<boolean[]>(() => journeySteps.map(() => false));
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const targets = stepRefs.current.filter((el): el is HTMLDivElement => el !== null);
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = Number((entry.target as HTMLElement).dataset.index);
          setVisible((prev) => {
            if (prev[index]) return prev;
            const next = [...prev];
            next[index] = true;
            return next;
          });
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.4, rootMargin: "0px 0px -10% 0px" }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="r-flow" aria-label="Come arrivano i tuoi clienti">
      {/* Se il JS non parte, il contenuto resta comunque visibile. */}
      <noscript>
        <style>{`.restaurant .r-flow-step{opacity:1!important;transform:none!important}`}</style>
      </noscript>

      <div className="r-flow-intro">
        <p className="eyebrow">
          <span className="dot" /> Come funziona davvero
        </p>
        <h2>Dal check-in al tuo tavolo.</h2>
        <p className="intro">
          Non pubblicità a pioggia. Un percorso reale che ogni giorno porta persone vere
          dalla porta di un B&amp;B fino alla tua.
        </p>
      </div>

      <div className="r-flow-timeline">
        <span className="r-flow-line" aria-hidden="true" />
        {[0, 1, 2].map((i) => (
          <span key={i} className="r-flow-traveler" style={{ animationDelay: `${i * 2.5}s` }} aria-hidden="true" />
        ))}

        {journeySteps.map((step, index) => (
          <div
            key={step.title}
            ref={(el) => {
              stepRefs.current[index] = el;
            }}
            data-index={index}
            className={`r-flow-step${visible[index] ? " is-visible" : ""}`}
            style={{ transitionDelay: visible[index] ? `${index * 90}ms` : "0ms" }}
          >
            <span className="r-flow-node">{index + 1}</span>
            <div className="r-flow-card">
              <span className="r-flow-icon">{step.icon}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="r-flow-outcome">
        <h3>
          Più clienti, <em>quando contano di più.</em>
        </h3>
      </div>
    </section>
  );
}

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
      [HONEYPOT_FIELD]: data.get(HONEYPOT_FIELD),
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
    <main className="restaurant">
      <section className="r-hero">
        <div className="r-hero-copy">
          <p className="eyebrow">Per i ristoranti</p>
          <h1>Nuovi clienti, proprio quando sono pronti a scegliere.</h1>
          <p className="intro">
            I turisti alloggiati negli hotel e B&amp;B partner trovano il tuo ristorante nella
            guida digitale Stayio, proprio mentre decidono dove mangiare.
          </p>
          <a href="#richiedi" className="r-cta">
            Richiedi informazioni <span aria-hidden="true">→</span>
          </a>
          <p className="r-hero-note">Ospiti in arrivo dalle strutture qui vicino.</p>
        </div>

        <div className="r-hero-media" style={{ backgroundImage: `url(${HERO_IMAGE})` }} />
      </section>

      <GuestJourneyFlow />

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
            <Honeypot />
            <div className="r-field">
              <label htmlFor="venueName">Nome del locale *</label>
              <input id="venueName" name="venueName" type="text" required maxLength={LEAD_FIELD_LIMITS.venueName} autoComplete="organization" />
            </div>

            <div className="r-field">
              <label htmlFor="city">Città / zona *</label>
              <input id="city" name="city" type="text" required maxLength={LEAD_FIELD_LIMITS.city} autoComplete="address-level2" />
            </div>

            <div className="r-field">
              <label htmlFor="name">Nome e cognome del referente *</label>
              <input id="name" name="name" type="text" required maxLength={LEAD_FIELD_LIMITS.name} autoComplete="name" />
            </div>

            <div className="r-field">
              <label htmlFor="email">Email *</label>
              <input id="email" name="email" type="email" required maxLength={LEAD_FIELD_LIMITS.email} autoComplete="email" />
            </div>

            <div className="r-field">
              <label htmlFor="phone">Telefono</label>
              <input id="phone" name="phone" type="tel" maxLength={LEAD_FIELD_LIMITS.phone} autoComplete="tel" />
            </div>

            <div className="r-field">
              <label htmlFor="seats">Numero di coperti</label>
              <input id="seats" name="seats" type="number" min={0} max={MAX_SEATS} step={1} inputMode="numeric" />
            </div>

            <div className="r-field r-field-full">
              <label htmlFor="message">Messaggio (facoltativo)</label>
              <textarea id="message" name="message" rows={4} maxLength={LEAD_FIELD_LIMITS.message} />
            </div>

            {status === "error" && <p className="r-form-error">{error}</p>}

            <button type="submit" className="r-submit" disabled={status === "sending"}>
              {status === "sending" ? "Invio in corso…" : "Invia richiesta"}
            </button>
            <PrivacyNote />
          </form>
        )}
      </section>
    </main>
  );
}
