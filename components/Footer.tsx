import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <Image
        src="/stayio-logo.svg"
        alt="Stayio"
        width={90}
        height={29}
        style={{ width: "90px", height: "auto" }}
      />
      <span className="footer-meta">
        <Link href="/privacy">Privacy</Link>
        <span aria-hidden="true">·</span>
        <span>© 2026 Stayio</span>
      </span>
    </footer>
  );
}
