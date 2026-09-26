import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pagina non trovata | Stayio",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="other">
      <section className="hero">
        <p className="eyebrow">Errore 404</p>
        <h1>Questa pagina non esiste.</h1>
        <p className="intro">
          Il link potrebbe essere sbagliato o la pagina è stata spostata. Se cercavi il link personale del tuo
          concierge, controlla di aver copiato l&apos;indirizzo completo che ti abbiamo inviato.
        </p>
        <Link href="/" className="r-cta">
          Torna alla home <span aria-hidden="true">→</span>
        </Link>
      </section>
    </main>
  );
}
