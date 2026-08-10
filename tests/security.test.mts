import assert from "node:assert/strict";
import test from "node:test";
import {
  createInviteToken,
  hashInviteToken,
  inviteExpiry,
  INVITE_TTL_MS,
} from "../src/lib/invites.ts";
import { safeCallbackUrl } from "../src/lib/navigation.ts";
import { takeRateLimit } from "../src/lib/rate-limit.ts";
import {
  normalizedEmail,
  optionalPositiveNumber,
  trimmedText,
} from "../src/lib/validation.ts";

test("callback URL hanya menerima navigasi internal", () => {
  assert.equal(safeCallbackUrl("/dashboard?tab=calls"), "/dashboard?tab=calls");
  assert.equal(safeCallbackUrl("javascript:alert(1)"), "/dashboard");
  assert.equal(safeCallbackUrl("https://evil.example"), "/dashboard");
  assert.equal(safeCallbackUrl("//evil.example"), "/dashboard");
  assert.equal(safeCallbackUrl("/\\evil.example"), "/dashboard");
});

test("token undangan acak, dapat di-hash, dan kedaluwarsa 72 jam", () => {
  const token = createInviteToken();
  assert.match(token, /^[A-Za-z0-9_-]{43}$/);
  assert.equal(hashInviteToken(token).length, 64);
  assert.notEqual(hashInviteToken(token), token);

  const now = Date.now();
  assert.equal(inviteExpiry(now).getTime(), now + INVITE_TTL_MS);
});

test("rate limiter menolak permintaan setelah batas", () => {
  const key = `test:${crypto.randomUUID()}`;
  assert.equal(takeRateLimit(key, 2, 1_000, 100).allowed, true);
  assert.equal(takeRateLimit(key, 2, 1_000, 200).allowed, true);
  assert.equal(takeRateLimit(key, 2, 1_000, 300).allowed, false);
  assert.equal(takeRateLimit(key, 2, 1_000, 1_101).allowed, true);
});

test("validasi input menormalisasi dan menolak nilai tidak aman", () => {
  assert.equal(normalizedEmail("  USER@Example.COM "), "user@example.com");
  assert.equal(normalizedEmail("invalid"), null);
  assert.equal(trimmedText("  alasan  ", 20, true), "alasan");
  assert.equal(trimmedText("terlalu panjang", 5), null);
  assert.equal(optionalPositiveNumber(1_000), 1_000);
  assert.equal(optionalPositiveNumber(-1), undefined);
  assert.equal(optionalPositiveNumber("1000"), undefined);
});
