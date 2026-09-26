import assert from "node:assert/strict";
import { test } from "node:test";

import { getClientIp, HONEYPOT_FIELD, isHoneypotFilled, normalizeIp } from "../lib/antispam.ts";

test("honeypot: vuoto o assente → ok, valorizzato → bot", () => {
  assert.equal(isHoneypotFilled({}), false);
  assert.equal(isHoneypotFilled({ [HONEYPOT_FIELD]: "" }), false);
  assert.equal(isHoneypotFilled({ [HONEYPOT_FIELD]: "   " }), false);
  assert.equal(isHoneypotFilled({ [HONEYPOT_FIELD]: null }), false);
  assert.equal(isHoneypotFilled({ [HONEYPOT_FIELD]: "https://spam.example" }), true);
  assert.equal(isHoneypotFilled({ [HONEYPOT_FIELD]: 1 }), true);
});

test("normalizeIp: IPv4 invariato, IPv4-mapped → IPv4", () => {
  assert.equal(normalizeIp("203.0.113.7"), "203.0.113.7");
  assert.equal(normalizeIp("::ffff:203.0.113.7"), "203.0.113.7");
});

test("normalizeIp: IPv6 → prefisso /64, stesse reti nello stesso bucket", () => {
  const a = normalizeIp("2001:db8:abcd:12:1111:2222:3333:4444");
  const b = normalizeIp("2001:0db8:abcd:0012:aaaa:bbbb:cccc:dddd");
  assert.equal(a, "2001:db8:abcd:12::");
  assert.equal(a, b);
  assert.equal(normalizeIp("2001:db8::1"), "2001:db8:0:0::");
});

test("normalizeIp: formati non riconosciuti restano invariati", () => {
  for (const ip of ["unknown", "::g", "1:2:3", "1::2::3"]) assert.equal(normalizeIp(ip), ip);
});

test("getClientIp: x-real-ip, poi il primo x-forwarded-for, poi unknown", () => {
  assert.equal(getClientIp(new Headers({ "x-real-ip": " 1.2.3.4 ", "x-forwarded-for": "9.9.9.9" })), "1.2.3.4");
  assert.equal(getClientIp(new Headers({ "x-forwarded-for": "5.6.7.8, 10.0.0.1" })), "5.6.7.8");
  assert.equal(getClientIp(new Headers()), "unknown");
});
