import assert from "node:assert/strict";
import { test } from "node:test";

import { keepActiveIds, MAX_RECOMMENDED_RESTAURANTS, sanitizeRecommendedIds } from "../lib/recommended-restaurants.ts";

const A = "11111111-1111-4111-8111-111111111111";
const B = "22222222-2222-4222-8222-222222222222";
const C = "33333333-3333-4333-8333-333333333333";
const D = "44444444-4444-4444-8444-444444444444";

test("campo assente o non array → null (nessuna modifica)", () => {
  assert.equal(sanitizeRecommendedIds(undefined), null);
  assert.equal(sanitizeRecommendedIds("abc"), null);
  assert.equal(sanitizeRecommendedIds({ 0: A }), null);
});

test("array vuoto → [] (svuota i consigliati)", () => {
  assert.deepEqual(sanitizeRecommendedIds([]), []);
});

test("id non validi scartati in silenzio", () => {
  assert.deepEqual(sanitizeRecommendedIds([A, "non-uuid", 42, null, "", B]), [A, B]);
});

test("id duplicati scartati, ordine della prima occorrenza", () => {
  assert.deepEqual(sanitizeRecommendedIds([B, A, B, A.toUpperCase()]), [B, A]);
});

test("troppi id: la normalizzazione li conserva, il chiamante vede > max", () => {
  const ids = sanitizeRecommendedIds([A, B, C, D]);
  assert.equal(ids.length, 4);
  assert.ok(ids.length > MAX_RECOMMENDED_RESTAURANTS);
});

test("4 valori ma solo 3 unici → entro il limite", () => {
  const ids = sanitizeRecommendedIds([A, B, C, A]);
  assert.deepEqual(ids, [A, B, C]);
  assert.ok(ids.length <= MAX_RECOMMENDED_RESTAURANTS);
});

test("keepActiveIds tiene solo gli id del catalogo attivo, in ordine", () => {
  assert.deepEqual(keepActiveIds([C, A, B], [A.toUpperCase(), C]), [C, A]);
  assert.deepEqual(keepActiveIds([A], []), []);
});
