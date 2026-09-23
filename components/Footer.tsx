import Image from "next/image";

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
      <span>© 2026 Stayio</span>
    </footer>
  );
}
