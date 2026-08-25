"use client";

import { FormEvent, startTransition, useEffect, useState } from "react";

type Language = "en" | "it";

const copy = {
  en: {
    nav: ["Discover", "For partners", "Contact"], languageLabel: "Change language",
    heroEyebrow: "Local discovery, made tangible", heroTitle: <>The best part<br />of your stay<br /><em>is waiting nearby.</em></>,
    heroIntro: "Stayio connects hosts, guests, and local places in one simple experience: the host opens the door, the guest finds somewhere worth going, and the local partner welcomes a new customer.", triad: ["Host", "Guest", "Restaurant / experience"], triadHint: "One local connection, three benefits", visualSteps: [["The host opens the door", "A thoughtful recommendation becomes part of the welcome.", "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=85"], ["The guest chooses", "A nearby idea becomes an easy plan for today.", "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=900&q=85"], ["The local place welcomes", "A restaurant or experience gains a new customer.", "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=85"]], bring: "Bring Stayio to your place", discoverMore: "Discover more",
    tag: <>look<br />around</>, guideLocation: "Napoli · Tonight", guideKicker: "Curated nearby", guideTitle: <>Eat well.<br /><i>Stay curious.</i></>, guidePills: ["Restaurants", "Bars", "See all →"], scribble: <>your local<br /><i>shortcut</i> <span>✳</span></>,
    statementEyebrow: "A new kind of local welcome", statementTitle: <>Not another directory.<br /><em>A better way in.</em></>, statementBody: "Stayio helps guests find the local-only restaurants, hidden places, and memorable experiences they might never discover alone, while helping partners create lasting value around every stay.",
    journeyEyebrow: "A little more discovery", journeyTitle: <>Make room for<br />a <em>better stay.</em></>, journeyText: ["Stayio introduces guests to a considered selection of restaurants, local favourites, and experiences that are often difficult to find on their own.", "For hosts, it becomes a service guests can enjoy during their stay. For restaurants, it creates a path to more customers today and more familiarity over the long term."], who: "See who it is for",
    events: [["A guest discovers", "Something worth trying"], ["A place gets noticed", "At exactly the right moment"], ["A plan takes shape", "From browsing to going out"], ["The experience continues", "For guest and business"]],
    audienceEyebrow: "A shared advantage", audienceTitle: <>Good for the guest.<br /><em>Worth it for the city.</em></>, benefits: [["For guests", "A more personal way to find local restaurants and experiences that are easy to miss without Stayio."], ["For hosts", "A distinctive service for B&Bs, hotels, and hosts to offer guests throughout their stay."], ["For restaurants", "A way to attract more customers today and build stronger customer activity over time."]],
    economicsEyebrow: "For restaurants", economicsTitle: <>More than<br /><em>visibility.</em></>, economicsText: "Stayio helps restaurants reach nearby guests when they are ready to choose, increasing customer activity in the short term while building awareness and repeat interest over time.", activity: "STAYIO / GUEST ACTIVITY", more: "More", reasons: "reasons to choose you", nearby: "Be discovered nearby", action: "Turn interest into action →",
    contactEyebrow: "There is more to discover", contactTitle: <>Interested in<br /><em>Stayio?</em></>, contactCopy: "Tell us a little about your restaurant, B&B, or hotel. We'll share just enough to explore whether Stayio belongs in the experience you create.", name: "Name", namePlaceholder: "Your name", email: "Email", emailPlaceholder: "you@yourplace.com", role: "I am a...", selectRole: "Select one", roles: ["Restaurant owner", "B&B owner", "Hotel owner or manager", "Host / property manager", "Hospitality partner", "Something else"], message: "Tell us about it", messagePlaceholder: "A few words about your place", sending: "Sending...", conversation: "Start a conversation", successTitle: "Message received.", successText: "We'll be in touch soon.", error: "We could not send your message. Please try again.", footer: "Local discovery, with a trace."
  },
  it: {
    nav: ["Scopri", "Per i partner", "Contatti"], languageLabel: "Cambia lingua",
    heroEyebrow: "Alla scoperta del territorio", heroTitle: <>La parte migliore<br />del tuo soggiorno<br /><em>è proprio qui vicino.</em></>,
    heroIntro: "Stayio mette in relazione host, ospiti e realtà locali in un’unica esperienza: chi ospita apre la porta, l’ospite trova un posto speciale e il partner locale accoglie un nuovo cliente.", triad: ["Host", "Ospite", "Ristorante / esperienza"], triadHint: "Un legame locale, tre vantaggi", visualSteps: [["L’host apre la porta", "Un consiglio curato diventa parte dell’accoglienza.", "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=85"], ["L’ospite sceglie", "Un’idea nei dintorni diventa un piano semplice per oggi.", "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=900&q=85"], ["La realtà locale accoglie", "Un ristorante o un’esperienza incontra un nuovo cliente.", "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=85"]], bring: "Porta Stayio nella tua struttura", discoverMore: "Scopri di più",
    tag: <>guarda<br />intorno</>, guideLocation: "Napoli · Stasera", guideKicker: "Una selezione nei dintorni", guideTitle: <>Mangia bene.<br /><i>Lasciati sorprendere.</i></>, guidePills: ["Ristoranti", "Locali", "Vedi tutto →"], scribble: <>la tua<br /><i>dritta locale</i> <span>✳</span></>,
    statementEyebrow: "Un nuovo modo di accogliere", statementTitle: <>Non il solito elenco.<br /><em>Un modo migliore per orientarsi.</em></>, statementBody: "Stayio aiuta gli ospiti a trovare ristoranti del posto, luoghi nascosti ed esperienze memorabili che difficilmente scoprirebbero da soli, offrendo a ogni partner un valore che dura nel tempo.",
    journeyEyebrow: "Un modo in più per scoprire", journeyTitle: <>Fai spazio a<br />un <em>soggiorno migliore.</em></>, journeyText: ["Stayio presenta agli ospiti una selezione ragionata di ristoranti, luoghi amati da chi vive in città ed esperienze spesso difficili da scoprire per chi non li conosce già.", "Per chi gestisce una struttura diventa un servizio da offrire durante il soggiorno. Per i ristoranti crea un percorso verso nuovi clienti e relazioni più durature."], who: "Scopri per chi è pensato",
    events: [["Un ospite scopre", "Qualcosa da provare"], ["Un luogo viene scoperto", "Proprio al momento giusto"], ["Un piano prende forma", "Dalla ricerca all’uscita"], ["L’esperienza continua", "Per ospiti e attività"]],
    audienceEyebrow: "Un vantaggio condiviso", audienceTitle: <>Un vantaggio per gli ospiti.<br /><em>Un valore per la città.</em></>, benefits: [["Per gli ospiti", "Un modo più personale per trovare ristoranti ed esperienze locali che senza Stayio sarebbe facile lasciarsi sfuggire."], ["Per chi ospita", "Un servizio distintivo per B&B, hotel e strutture ricettive da offrire agli ospiti durante il soggiorno."], ["Per i ristoranti", "Un modo per attrarre più clienti oggi e costruire una relazione più forte nel tempo."]],
    economicsEyebrow: "Per i ristoranti", economicsTitle: <>Più della<br /><em>visibilità.</em></>, economicsText: "Stayio aiuta i ristoranti a raggiungere gli ospiti vicini quando sono pronti a scegliere, aumentando le visite nel breve periodo e rafforzando notorietà e ritorno nel tempo.", activity: "STAYIO / ATTIVITÀ DEGLI OSPITI", more: "Più", reasons: "motivi per sceglierti", nearby: "Fatti trovare nei dintorni", action: "Trasforma l'interesse in una visita →",
    contactEyebrow: "C’è ancora molto da scoprire", contactTitle: <>Ti interessa<br /><em>Stayio?</em></>, contactCopy: "Raccontaci qualcosa del tuo ristorante, B&B o hotel. Ti spiegheremo come funziona, così potrai capire se Stayio può arricchire l’esperienza che crei.", name: "Nome", namePlaceholder: "Il tuo nome", email: "Email", emailPlaceholder: "tuo@posto.it", role: "Sono...", selectRole: "Scegli un’opzione", roles: ["Titolare di ristorante", "Titolare di B&B", "Titolare o manager di hotel", "Gestore di una struttura o proprietà", "Partner nel settore dell’ospitalità", "Altro"], message: "Parlaci della tua attività", messagePlaceholder: "Qualche parola sulla tua attività", sending: "Invio...", conversation: "Inizia una conversazione", successTitle: "Messaggio ricevuto.", successText: "Ti ricontatteremo presto.", error: "Non è stato possibile inviare il messaggio. Riprova.", footer: "Scoprire il territorio, lasciando una traccia."
  }
} as const;

export default function Home() {
  const [language, setLanguage] = useState<Language>("en");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const text = copy[language];

  useEffect(() => {
    if (window.localStorage.getItem("stayio-language") === "it") {
      startTransition(() => setLanguage("it"));
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem("stayio-language", language);
  }, [language]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError("");

    const response = await fetch("/api/contact", {
      body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (response.ok) {
      setSent(true);
    } else {
      const result = await response.json().catch(() => null);
      setError(result?.error || text.error);
    }

    setSending(false);
  }

  return (
    <main>
      <nav className="nav-shell" aria-label="Main navigation"><a className="wordmark" href="#top">Stayio</a><div className="nav-links"><a href="#how-it-works">{text.nav[0]}</a><a href="#for-businesses">{text.nav[1]}</a><a href="#contact">{text.nav[2]}</a></div><div className="nav-actions"><a className="nav-cta" href="#contact">{language === "en" ? "Talk to us" : "Parliamone"} <span>↗</span></a><div className="language-switcher" aria-label={text.languageLabel}><button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")} type="button">🇬🇧 EN</button><button className={language === "it" ? "active" : ""} onClick={() => setLanguage("it")} type="button">🇮🇹 IT</button></div></div></nav>
      <section className="hero" id="top"><div className="hero-copy"><p className="eyebrow"><span className="eyebrow-dot" /> {text.heroEyebrow}</p><h1>{text.heroTitle}</h1><p className="hero-intro">{text.heroIntro}</p><div className="hero-triad" aria-label={text.triadHint}>{text.triad.map((role, index) => <div className="triad-step" key={role}><span className="triad-number">0{index + 1}</span><strong>{role}</strong>{index < text.triad.length - 1 && <span className="triad-arrow">→</span>}</div>)}</div><div className="hero-actions"><a className="button button-dark" href="#contact">{text.bring} <span>↗</span></a><a className="text-link" href="#how-it-works">{text.discoverMore} <span>↓</span></a></div></div><div className="hero-art" aria-label="Stayio welcome object beside a local guide card" role="img"><div className="sun-disc" /><div className="tag-object"><span>stayio</span><b>{text.tag}</b><small>stayio.app</small></div><div className="guide-card"><div className="mini-top"><span className="mini-mark">stayio<span>.</span></span><span>{text.guideLocation}</span></div><div className="guide-image" /><p className="mini-kicker">{text.guideKicker}</p><h3>{text.guideTitle}</h3><div className="mini-pills">{text.guidePills.map((pill) => <span key={pill}>{pill}</span>)}</div></div><div className="scribble">{text.scribble}</div></div></section>
      <section className="role-visuals" aria-label={text.triadHint}><div className="role-visuals-intro"><p className="eyebrow">{text.triadHint}</p><p>{language === "en" ? "Stayio gives each side a reason to take part." : "Stayio crea un valore concreto per tutti."}</p></div><div className="role-visual-grid">{text.visualSteps.map(([title, detail, image], index) => <article className="role-visual" key={title}><div className="role-visual-image" style={{ backgroundImage: `url(${image})` }} /><div className="role-visual-copy"><span>0{index + 1}</span><h3>{title}</h3><p>{detail}</p></div></article>)}</div></section>
      <section className="statement-band"><p className="eyebrow">{text.statementEyebrow}</p><h2>{text.statementTitle}</h2><p className="statement-body">{text.statementBody}</p></section>
      <section className="journey section-wrap" id="how-it-works"><div className="section-heading"><p className="eyebrow">{text.journeyEyebrow}</p><h2>{text.journeyTitle}</h2></div><div className="journey-grid"><div className="journey-explainer"><p>{text.journeyText[0]}</p><p>{text.journeyText[1]}</p><a className="text-link" href="#for-businesses">{text.who} <span>↗</span></a></div><div className="event-log">{text.events.map(([label, detail], index) => <div className="event-row" key={label}><span className="event-number">0{index + 1}</span><span className="event-name">{label}</span><span className="event-detail">{detail}</span><span className="event-check">✓</span></div>)}<div className="log-line" /></div></div></section>
      <section className="audience-section" id="for-businesses"><div className="section-wrap"><div className="section-heading"><p className="eyebrow">{text.audienceEyebrow}</p><h2>{text.audienceTitle}</h2></div><div className="benefit-grid">{text.benefits.map(([title, benefitText], index) => <article className="benefit" key={title}><span className="benefit-index">0{index + 1}</span><h3>{title}</h3><p>{benefitText}</p></article>)}</div></div></section>
      <section className="economics section-wrap"><div className="economics-copy"><p className="eyebrow">{text.economicsEyebrow}</p><h2>{text.economicsTitle}</h2><p>{text.economicsText}</p></div><div className="outcome-card"><div className="outcome-header"><span>{text.activity}</span><span>LIVE</span></div><div className="outcome-amount"><strong>{text.more}</strong><small>{text.reasons}</small></div><div className="outcome-bar"><span /><span /><span /><span /><span /></div><div className="outcome-footer"><span>{text.nearby}</span><b>{text.action}</b></div></div></section>
      <section className="contact-section" id="contact"><div className="contact-inner"><div><p className="eyebrow">{text.contactEyebrow}</p><h2>{text.contactTitle}</h2><p className="contact-copy">{text.contactCopy}</p></div><form className="contact-form" onSubmit={handleSubmit}>{sent ? <div className="success-message"><span>✓</span><h3>{text.successTitle}</h3><p>{text.successText}</p></div> : <><label>{text.name} <input name="name" placeholder={text.namePlaceholder} required /></label><label>{text.email} <input name="email" type="email" placeholder={text.emailPlaceholder} required /></label><label>{text.role} <select name="role" defaultValue="" required><option value="" disabled>{text.selectRole}</option>{text.roles.map((role) => <option key={role}>{role}</option>)}</select></label><label>{text.message} <textarea name="message" placeholder={text.messagePlaceholder} rows={3} /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-light" disabled={sending} type="submit">{sending ? text.sending : text.conversation} <span>↗</span></button></>}</form></div></section>
      <footer><a className="wordmark" href="#top">Stayio</a><span>{text.footer}</span><span>© 2025 Stayio</span></footer>
    </main>
  );
}
