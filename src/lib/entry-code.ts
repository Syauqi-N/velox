import { createHash, randomBytes } from "node:crypto";

export const ENTRY_CODE_TTL_MS = 72 * 60 * 60 * 1000;

// Ambiguous characters (0/O/1/I/L) excluded for ease of typing.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const PATTERN = /^[A-Z2-9]{4}-[A-Z2-9]{4}$/;

export function createEntryCode(): string {
  const rand = randomBytes(8);
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += ALPHABET[rand[i] % ALPHABET.length];
  }
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}

export function validateEntryCode(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const code = value.trim().toUpperCase();
  return PATTERN.test(code) ? code : null;
}

export function hashEntryCode(code: string): string {
  return createHash("sha256").update(code.toUpperCase()).digest("hex");
}

export function entryCodeExpiry(now = Date.now()): Date {
  return new Date(now + ENTRY_CODE_TTL_MS);
}
