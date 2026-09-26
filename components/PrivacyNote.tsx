import Link from "next/link";

/** Riga sotto i pulsanti di invio dei form: rimanda all'informativa. */
export default function PrivacyNote() {
  return (
    <p className="form-privacy-note">
      Inviando il modulo dichiari di aver letto l&apos;<Link href="/privacy">Informativa privacy</Link>.
    </p>
  );
}
