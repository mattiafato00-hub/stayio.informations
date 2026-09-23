"use client";

import Link from "next/link";

const categories = [
  {
    href: "/host",
    title: "Ho un B&B",
    text: "Un concierge digitale per i tuoi ospiti, gratuito.",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
  },
  {
    href: "/restaurant",
    title: "Ho un ristorante",
    text: "Fatti trovare da chi è già in zona.",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
  },
  {
    href: "/other",
    title: "Altro",
    text: "Bar, esperienze, eventi, investitori — parliamone.",
    image: "https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&fit=crop&w=800&q=80",
  },
];

export default function Home() {
  return (
    <main>
      <section className="hero">
        <p className="eyebrow">Per chi accoglie, per chi serve, per chi scopre</p>
        <h1>
          Nuovi clienti, proprio quando sono pronti a scegliere.
        </h1>
        <p className="intro">
          Chi ospita ti apre la porta. Chi arriva, si siede al tuo tavolo.
        </p>
      </section>

      <section className="categories-section">
        <p className="categories-label">Scegli la tua categoria</p>
        <div className="categories" aria-label="Scegli la tua categoria">
          {categories.map((cat) => (
            <Link href={cat.href} className="category-card" key={cat.href}>
              <div className="category-image" style={{ backgroundImage: `url(${cat.image})` }} />
              <div className="category-body">
                <h2>{cat.title}</h2>
                <p>{cat.text}</p>
                <span className="category-cta">Scopri come funziona →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
