import { HONEYPOT_FIELD } from "@/lib/antispam";

/**
 * Campo trappola per i bot (vedi lib/antispam.ts): fuori schermo, escluso
 * dalla navigazione da tastiera e dai lettori di schermo, senza
 * autocompilazione. Una persona non lo vede e non lo compila mai.
 */
export default function Honeypot() {
  return (
    <div
      aria-hidden="true"
      style={{ position: "absolute", left: "-10000px", top: "auto", width: 1, height: 1, overflow: "hidden" }}
    >
      <label htmlFor={HONEYPOT_FIELD}>Lascia vuoto questo campo</label>
      <input id={HONEYPOT_FIELD} name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
    </div>
  );
}
