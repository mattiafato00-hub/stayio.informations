"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

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

// --- Cosa succede dopo l'attivazione: dal modulo al primo ospite che
// non ti scrive più a mezzanotte per il Wi-Fi. Stessa struttura/CSS
// condivisa con il flusso della pagina /restaurant (:is(.restaurant,
// .host) .r-flow*), contenuto adattato ai benefici dell'host: il
// concierge come servizio in più offerto senza sforzo, e le domande
// ripetitive che non arrivano più a te.
const conciergeJourneySteps = [
  {
    title: "Racconti la tua struttura",
    text: "Un modulo semplice: Wi-Fi, orari, regole della casa. Lo compili una volta, lo aggiorni quando vuoi.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 3h9l4 4v14H6Z" />
        <path d="M15 3v4h4" />
        <path d="M9 12h7M9 16h7" />
      </svg>
    ),
  },
  {
    title: "Il tuo concierge è pronto",
    text: "Lo attiviamo noi nella tua struttura: i tuoi ospiti lo trovano da soli, senza installare nulla.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12.5 2.5 2.5 5-5.5" />
      </svg>
    ),
  },
  {
    title: "Un ospite ha una domanda",
    text: "Wi-Fi? Check-in? Un posto dove mangiare stasera? Prima o poi arriva sempre, a qualsiasi ora.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .7-1 1.4v.3" />
        <circle cx="12" cy="16.7" r="0.15" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Il concierge risponde, non tu",
    text: "24 ore su 24, anche quando dormi o sei fuori — niente più messaggi ripetuti a tutte le ore.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.5 2" />
      </svg>
    ),
  },
  {
    title: "Il tuo ospite si sente seguito",
    text: "Un servizio in più che offri senza sforzo — e che si vede nelle recensioni della tua struttura.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 20.5s-7.5-4.6-7.5-10A4.5 4.5 0 0 1 12 7.3 4.5 4.5 0 0 1 19.5 10.5c0 5.4-7.5 10-7.5 10Z" />
      </svg>
    ),
  },
];

/**
 * Sezione "cosa succede dopo l'attivazione": stessa timeline animata a
 * scroll-reveal + puntini in loop della pagina /restaurant, con
 * contenuto adattato ai benefici dell'host (vedi conciergeJourneySteps).
 */
function HostConciergeFlow() {
  const [visible, setVisible] = useState<boolean[]>(() => conciergeJourneySteps.map(() => false));
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
    <section className="r-flow" aria-label="Cosa succede dopo l'attivazione">
      <noscript>
        <style>{`.host .r-flow-step{opacity:1!important;transform:none!important}`}</style>
      </noscript>

      <div className="r-flow-intro">
        <p className="eyebrow">Come funziona davvero</p>
        <h2>Sempre lì, anche quando tu non ci sei.</h2>
        <p className="intro">
          Non un&apos;app in più da gestire. Un aiuto reale che risponde ai tuoi ospiti ogni
          giorno, comparendo solo quando serve davvero.
        </p>
      </div>

      <div className="r-flow-timeline">
        <span className="r-flow-line" aria-hidden="true" />
        {[0, 1, 2].map((i) => (
          <span key={i} className="r-flow-traveler" style={{ animationDelay: `${i * 2.5}s` }} aria-hidden="true" />
        ))}

        {conciergeJourneySteps.map((step, index) => (
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
          Meno domande. <em>Ospiti più felici.</em>
        </h3>
      </div>
    </section>
  );
}

type Status = "idle" | "sending" | "sent" | "error";

export default function HostPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

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

  return (
    <main className="host">
      <section className="r-hero">
        <div className="r-hero-copy">
          <p className="eyebrow">Per chi ospita</p>
          <h1>Il concierge digitale che risponde ai tuoi ospiti al posto tuo.</h1>
          <p className="intro">
            Wi-Fi, check-in, regole della casa, consigli sul quartiere: una pagina sempre aggiornata
            che i tuoi ospiti consultano da soli, 24/7. Gratuita.
          </p>
          <a href="#registra" className="r-cta">
            Attiva il concierge gratuito <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="r-hero-media" style={{ backgroundImage: `url(${HERO_IMAGE})` }} />
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

      <HostConciergeFlow />

      <section className="r-form-section" id="registra">
        <div className="r-form-intro">
          <p className="eyebrow">Gratis · 30 secondi</p>
          <h2>Attiva il tuo concierge</h2>
          <p>Ci servono solo tre cose per crearlo. I dettagli li aggiungi dopo, con calma.</p>
        </div>

        {status === "sent" ? (
          <div className="r-success" role="status">
            <span className="r-success-mark" aria-hidden="true">✓</span>
            <h3>Richiesta ricevuta.</h3>
            <p>
              Grazie! Ti contattiamo a breve per attivare il tuo concierge e darti il tuo link
              personale per aggiungere Wi-Fi, regole della casa e tutte le info utili ai tuoi ospiti.
            </p>
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
    </main>
  );
}
