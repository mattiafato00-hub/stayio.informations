"use client";

import { FormEvent, useState } from "react";

const events = [
  { label: "A guest discovers", detail: "Something worth trying", icon: "01" },
  { label: "A place gets noticed", detail: "At exactly the right moment", icon: "02" },
  { label: "A plan takes shape", detail: "From browsing to going out", icon: "03" },
  { label: "The experience continues", detail: "For guest and business", icon: "04" },
];

const benefits = [
  ["For guests", "A more personal way to find local restaurants and experiences that are easy to miss without Stayio."],
  ["For hosts", "A distinctive service for B&Bs, hotels, and hosts to offer guests throughout their stay."],
  ["For restaurants", "A way to attract more customers today and build stronger customer activity over time."],
];

export default function Home() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

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
      setError(result?.error || "We could not send your message. Please try again.");
    }

    setSending(false);
  }

  return (
    <main>
      <nav className="nav-shell" aria-label="Main navigation"><a className="wordmark" href="#top">Stayio</a><div className="nav-links"><a href="#how-it-works">Discover</a><a href="#for-businesses">For partners</a><a href="#contact">Contact</a></div><a className="nav-cta" href="#contact">Talk to us <span>↗</span></a></nav>
      <section className="hero" id="top"><div className="hero-copy"><p className="eyebrow"><span className="eyebrow-dot" /> Local discovery, made tangible</p><h1>The best part<br />of your stay<br /><em>is waiting nearby.</em></h1><p className="hero-intro">Stayio brings a more thoughtful sense of place to every stay, while helping local businesses become part of the moments guests remember.</p><div className="hero-actions"><a className="button button-dark" href="#contact">Bring Stayio to your place <span>↗</span></a><a className="text-link" href="#how-it-works">Discover more <span>↓</span></a></div></div><div className="hero-art" aria-label="A Stayio welcome object beside a local guide card" role="img"><div className="sun-disc" /><div className="tag-object"><span>stayio</span><b>look<br />around</b><small>stayio.app</small></div><div className="guide-card"><div className="mini-top"><span className="mini-mark">stayio<span>.</span></span><span>Napoli · Tonight</span></div><div className="guide-image" /><p className="mini-kicker">Curated nearby</p><h3>Eat well.<br /><i>Stay curious.</i></h3><div className="mini-pills"><span>Restaurants</span><span>Bars</span><span>See all →</span></div></div><div className="scribble">your local<br /><i>shortcut</i> <span>✳</span></div></div></section>
      <section className="statement-band"><p className="eyebrow">A new kind of local welcome</p><h2>Not another directory.<br /><em>A better way in.</em></h2><p className="statement-body">Stayio helps guests find the local-only restaurants, hidden places, and memorable experiences they might never discover alone, while helping partners create lasting value around every stay.</p></section>
      <section className="journey section-wrap" id="how-it-works"><div className="section-heading"><p className="eyebrow">A little more discovery</p><h2>Make room for<br />a <em>better stay.</em></h2></div><div className="journey-grid"><div className="journey-explainer"><p>Stayio introduces guests to a considered selection of restaurants, local favourites, and experiences that are often difficult to find on their own.</p><p>For hosts, it becomes a service guests can enjoy during their stay. For restaurants, it creates a path to more customers today and more familiarity over the long term.</p><a className="text-link" href="#for-businesses">See who it is for <span>↗</span></a></div><div className="event-log">{events.map((item) => <div className="event-row" key={item.label}><span className="event-number">{item.icon}</span><span className="event-name">{item.label}</span><span className="event-detail">{item.detail}</span><span className="event-check">✓</span></div>)}<div className="log-line" /></div></div></section>
      <section className="audience-section" id="for-businesses"><div className="section-wrap"><div className="section-heading"><p className="eyebrow">A shared advantage</p><h2>Good for the guest.<br /><em>Worth it for the city.</em></h2></div><div className="benefit-grid">{benefits.map(([title, text], index) => <article className="benefit" key={title}><span className="benefit-index">0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>
      <section className="economics section-wrap"><div className="economics-copy"><p className="eyebrow">For restaurants</p><h2>More than<br /><em>visibility.</em></h2><p>Stayio helps restaurants reach nearby guests when they are ready to choose, increasing customer activity in the short term while building awareness and repeat interest over time.</p></div><div className="outcome-card"><div className="outcome-header"><span>STAYIO / GUEST ACTIVITY</span><span>LIVE</span></div><div className="outcome-amount"><strong>More</strong><small>reasons to choose you</small></div><div className="outcome-bar"><span /><span /><span /><span /><span /></div><div className="outcome-footer"><span>Be discovered nearby</span><b>Turn interest into action →</b></div></div></section>
      <section className="contact-section" id="contact"><div className="contact-inner"><div><p className="eyebrow">There is more to discover</p><h2>Interested in<br /><em>Stayio?</em></h2><p className="contact-copy">Tell us a little about your restaurant, B&B, or hotel. We&apos;ll share just enough to explore whether Stayio belongs in the experience you create.</p></div><form className="contact-form" onSubmit={handleSubmit}>{sent ? <div className="success-message"><span>✓</span><h3>Message received.</h3><p>We&apos;ll be in touch soon.</p></div> : <><label>Name <input name="name" placeholder="Your name" required /></label><label>Email <input name="email" type="email" placeholder="you@yourplace.com" required /></label><label>I am a... <select name="role" defaultValue="" required><option value="" disabled>Select one</option><option>Restaurant owner</option><option>B&B owner</option><option>Hotel owner or manager</option><option>Host / property manager</option><option>Hospitality partner</option><option>Something else</option></select></label><label>Tell us about it <textarea name="message" placeholder="A few words about your place" rows={3} /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-light" disabled={sending} type="submit">{sending ? "Sending..." : "Start a conversation"} <span>↗</span></button></>}</form></div></section>
      <footer><a className="wordmark" href="#top">Stayio</a><span>Local discovery, with a trace.</span><span>© 2025 Stayio</span></footer>
    </main>
  );
}
