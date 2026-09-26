import assert from "node:assert/strict";
import { test } from "node:test";

import {
  FAQ_LIMITS,
  isValidEmail,
  optionalSeats,
  optionalText,
  parseFaqs,
  readJsonObject,
  requiredEmail,
  requiredText,
  ValidationError,
} from "../lib/validation.ts";

const req = (body, headers = {}) =>
  new Request("http://localhost/api", { method: "POST", body, headers: { "content-type": "application/json", ...headers } });

test("readJsonObject: oggetto valido", async () => {
  assert.deepEqual(await readJsonObject(req('{"a":1}'), 100), { a: 1 });
});

test("readJsonObject: body non JSON, null, array, stringa → 400", async () => {
  for (const body of ["ciao", "null", "[1,2]", '"x"', ""]) {
    await assert.rejects(readJsonObject(req(body), 100), (e) => e instanceof ValidationError && e.status === 400);
  }
});

test("readJsonObject: oltre il tetto → 413 (anche con content-length falso)", async () => {
  const big = JSON.stringify({ a: "x".repeat(200) });
  await assert.rejects(readJsonObject(req(big), 100), (e) => e.status === 413);
  await assert.rejects(readJsonObject(req(big, { "content-length": "5" }), 100), (e) => e.status === 413);
});

test("optionalText: assente → undefined, null/vuoto → null, trim", () => {
  assert.equal(optionalText({}, "a", 10, "A"), undefined);
  assert.equal(optionalText({ a: null }, "a", 10, "A"), null);
  assert.equal(optionalText({ a: "   " }, "a", 10, "A"), null);
  assert.equal(optionalText({ a: "  ciao " }, "a", 10, "A"), "ciao");
});

test("optionalText: tipo sbagliato o troppo lungo → 400 (non svuota più in silenzio)", () => {
  for (const v of [{ x: 1 }, 123, true, ["a"]]) {
    assert.throws(() => optionalText({ a: v }, "a", 10, "Campo"), /Campo: valore non valido/);
  }
  assert.throws(() => optionalText({ a: "x".repeat(11) }, "a", 10, "Campo"), /massimo 10 caratteri/);
  assert.equal(optionalText({ a: "x".repeat(10) }, "a", 10, "Campo"), "x".repeat(10));
});

test("requiredText: assente o vuoto → errore", () => {
  assert.throws(() => requiredText({}, "a", 10, "Il nome"), /Il nome è obbligatorio/);
  assert.throws(() => requiredText({ a: " " }, "a", 10, "Il nome"), /obbligatorio/);
  assert.equal(requiredText({ a: "Mario" }, "a", 10, "Il nome"), "Mario");
});

test("email: valide e non valide", () => {
  for (const ok of ["a@b.it", "nome.cognome+tag@dominio.com"]) assert.ok(isValidEmail(ok), ok);
  for (const ko of ["", "a", "a@b", "a@b.c", "a b@c.it", "a@b.it, c@d.it", "Nome <a@b.it>", `${"x".repeat(250)}@b.it`]) {
    assert.ok(!isValidEmail(ko), ko);
  }
  assert.throws(() => requiredEmail({ email: "no" }), /email valida/);
  assert.throws(() => requiredEmail({ email: 5 }), ValidationError);
  assert.equal(requiredEmail({ email: " a@b.it " }), "a@b.it");
});

test("optionalSeats: intero 0..9999, anche come stringa", () => {
  assert.equal(optionalSeats({}), null);
  assert.equal(optionalSeats({ seats: "" }), null);
  assert.equal(optionalSeats({ seats: "40" }), 40);
  assert.equal(optionalSeats({ seats: 0 }), 0);
  for (const v of [-1, 10000, 2.5, "abc", {}, true]) {
    assert.throws(() => optionalSeats({ seats: v }), /coperti/, String(v));
  }
});

test("parseFaqs: assente → null, righe incomplete scartate", () => {
  assert.equal(parseFaqs(undefined), null);
  assert.deepEqual(
    parseFaqs([
      { question: " Q1 ", answer: " A1 " },
      { question: "", answer: "solo risposta" },
      { question: "solo domanda" },
    ]),
    [{ question: "Q1", answer: "A1" }],
  );
});

test("parseFaqs: formato non valido, troppe FAQ o testi troppo lunghi → 400", () => {
  assert.throws(() => parseFaqs("x"), ValidationError);
  assert.throws(() => parseFaqs([null]), ValidationError);
  assert.throws(() => parseFaqs([{ question: 1, answer: "a" }]), /Domanda 1/);
  const tooMany = Array.from({ length: FAQ_LIMITS.maxItems + 1 }, () => ({ question: "q", answer: "a" }));
  assert.throws(() => parseFaqs(tooMany), /al massimo 30/);
  assert.throws(() => parseFaqs([{ question: "q", answer: "a".repeat(FAQ_LIMITS.answer + 1) }]), /Risposta 1/);
});
