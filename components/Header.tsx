"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <nav className="nav">
      {/* Il wrapper resta sempre <Link> (mai scambiato con l'immagine
          nuda) cosi l'elemento <Image> non viene mai smontato/rimontato
          quando isHome cambia durante la navigazione client-side: il
          reveal CSS, legato al mount, parte cosi una sola volta per
          sessione invece di ripetersi ogni volta che si passa da/verso
          la home. */}
      <Link
        href="/"
        aria-disabled={isHome || undefined}
        aria-current={isHome ? "page" : undefined}
        tabIndex={isHome ? -1 : 0}
        onClick={isHome ? (event) => event.preventDefault() : undefined}
        style={isHome ? { cursor: "default" } : undefined}
      >
        <Image
          src="/stayio-logo.svg"
          alt="Stayio"
          width={325}
          height={104}
          style={{ width: "325px", height: "auto" }}
          className="logo-reveal"
          priority
        />
      </Link>
    </nav>
  );
}
