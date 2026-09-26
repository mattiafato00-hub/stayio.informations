import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Informativa privacy | Stayio",
  description: "Come Stayio raccoglie, usa e protegge i dati personali inviati tramite i moduli del sito e la pagina concierge.",
  path: "/privacy",
});

const CONTACT_EMAIL = "stayio267@gmail.com";

export default function PrivacyPage() {
  return (
    <main className="privacy">
      <article className="privacy-body">
        <h1>Informativa privacy</h1>
        <p className="privacy-updated">Ultimo aggiornamento: 26 settembre 2026</p>

        <h2>Titolare del trattamento</h2>
        <p>
          Mattia Fato, Bari (Italia) – progetto Stayio.
          <br />
          Contatto: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>

        <h2>Quali dati raccogliamo</h2>
        <ul>
          <li>
            <strong>Moduli di contatto e iscrizione</strong> (host, ristoratori, altre attività): nome e cognome, email,
            telefono, nome e città dell&apos;attività, numero di coperti, tipo di attività e il messaggio che scegli di
            scriverci.
          </li>
          <li>
            <strong>Pagina di gestione del concierge</strong> (solo host): le informazioni sulla struttura che inserisci
            tu, per esempio Wi-Fi, check-in, accesso, parcheggio, regole della casa, FAQ e ristoranti consigliati.
          </li>
          <li>
            <strong>Dati tecnici</strong>: indirizzo IP, usato solo per proteggere i moduli da spam e abusi.
          </li>
        </ul>
        <p>Non usiamo cookie di profilazione né strumenti di analisi o pubblicità.</p>

        <h2>Perché li usiamo</h2>
        <ul>
          <li>
            Rispondere alle tue richieste e valutare la tua adesione a Stayio (base giuridica: misure precontrattuali
            richieste da te, art. 6.1.b GDPR).
          </li>
          <li>
            Fornire il concierge digitale ai tuoi ospiti con le informazioni che inserisci (esecuzione del servizio, art.
            6.1.b GDPR).
          </li>
          <li>Proteggere il sito da spam e abusi (legittimo interesse, art. 6.1.f GDPR).</li>
        </ul>
        <p>Non vendiamo i tuoi dati e non li usiamo per newsletter o marketing senza il tuo consenso.</p>

        <h2>Chi tratta i dati per nostro conto</h2>
        <ul>
          <li>
            <strong>Supabase</strong> – database (server nell&apos;Unione Europea, Irlanda).
          </li>
          <li>
            <strong>Vercel</strong> – hosting del sito.
          </li>
          <li>
            <strong>Google (Gmail)</strong> – ricezione delle notifiche sulle nuove richieste.
          </li>
          <li>
            <strong>Anthropic</strong> – solo per il concierge: le informazioni della struttura vengono usate
            dall&apos;assistente AI per rispondere alle domande degli ospiti.
          </li>
        </ul>
        <p>
          Alcuni di questi fornitori hanno sede negli Stati Uniti. Il trasferimento avviene con le garanzie previste dal
          GDPR (EU-U.S. Data Privacy Framework o Clausole Contrattuali Standard).
        </p>

        <h2>Per quanto tempo</h2>
        <ul>
          <li>Richieste di contatto non seguite da una collaborazione: fino a 24 mesi, poi vengono cancellate.</li>
          <li>
            Dati di host e attività partner: per tutta la durata della collaborazione e cancellati su richiesta al
            termine.
          </li>
        </ul>

        <h2>I tuoi diritti</h2>
        <p>
          Puoi chiedere in qualsiasi momento di accedere ai tuoi dati, correggerli, cancellarli, limitarne l&apos;uso,
          riceverne una copia o opporti al trattamento, scrivendo a{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Hai anche il diritto di presentare reclamo al Garante
          per la protezione dei dati personali (
          <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer">
            www.garanteprivacy.it
          </a>
          ).
        </p>

        <h2>Modifiche</h2>
        <p>Possiamo aggiornare questa informativa. La data in alto indica l&apos;ultima versione.</p>
      </article>
    </main>
  );
}
