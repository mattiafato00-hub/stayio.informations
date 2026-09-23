"use client";

import { FormEvent, useState } from "react";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&fit=crop&w=1200&q=80";

const roleOptions = ["Bar", "Beach club", "Esperienze/eventi", "Investitore", "Altro"];

const audiences = [
  "Bar e caffetterie",
  "Beach club",
  "Esperienze & eventi",
  "Investitori",
  "Idee che non hanno ancora una categoria",
];

type Status = "idle" | "sending" | "sent" | "error";

export default function OtherPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");

    const data = new FormData(event.currentTarget);
    const payload = {
      role: data.get("role"),
      name: data.get("name"),
      email: data.get("email"),
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
    <main className="other">
      <section className="r-hero">
        <div className="r-hero-copy">
          <p className="eyebrow">Tutto il resto</p>
          <h1>Hai un&apos;attività locale, o sei interessato a Stayio in altro modo?</h1>
          <p className="intro">
            Se gestisci un bar, un beach club, organizzi esperienze o eventi, sei un investitore
            interessato al progetto, o semplicemente pensi che Stayio possa aiutarti in un modo che non
            rientra nelle categorie qui sopra, raccontaci di più — valutiamo insieme come procedere.
          </p>
          <a href="#scrivici" className="r-cta">
            Scrivici <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="r-hero-media" style={{ backgroundImage: `url(${HERO_IMAGE})` }}>
          <div className="r-hero-badge">
            <span className="r-hero-badge-pulse" aria-hidden="true" />
            <div>
              <strong>Parliamone</strong>
              <span>ti rispondiamo entro pochi giorni</span>
            </div>
          </div>
        </div>
      </section>

      <section className="o-audiences" aria-label="Chi ci scrive di solito">
        <p className="o-audiences-label">Chi ci scrive di solito</p>
        <ul className="o-audiences-list">
          {audiences.map((audience) => (
            <li key={audience}>{audience}</li>
          ))}
        </ul>
      </section>

      <section className="r-form-section" id="scrivici">
        <div className="r-form-intro">
          <p className="eyebrow">
            <span className="dot" /> Meno di un minuto
          </p>
          <h2>Raccontaci di più</h2>
          <p>Poche righe bastano. Ti rispondiamo noi con i passi successivi.</p>
        </div>

        {status === "sent" ? (
          <div className="r-success" role="status">
            <span className="r-success-mark" aria-hidden="true">✓</span>
            <h3>Grazie! Ti ricontatteremo presto.</h3>
            <p>Abbiamo ricevuto il tuo messaggio.</p>
          </div>
        ) : (
          <form className="r-form" onSubmit={handleSubmit}>
            <div className="r-field">
              <label htmlFor="name">Nome *</label>
              <input id="name" name="name" type="text" required autoComplete="name" />
            </div>

            <div className="r-field">
              <label htmlFor="email">Email *</label>
              <input id="email" name="email" type="email" required autoComplete="email" />
            </div>

            <div className="r-field r-field-full">
              <label htmlFor="role">Che tipo di attività / interesse hai *</label>
              <select id="role" name="role" required defaultValue="">
                <option value="" disabled>
                  Seleziona un&apos;opzione
                </option>
                {roleOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="r-field r-field-full">
              <label htmlFor="message">Messaggio (facoltativo)</label>
              <textarea id="message" name="message" rows={4} />
            </div>

            {status === "error" && <p className="r-form-error">{error}</p>}

            <button type="submit" className="r-submit" disabled={status === "sending"}>
              {status === "sending" ? "Invio in corso…" : "Invia messaggio"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
