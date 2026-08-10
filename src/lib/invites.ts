import { createHash, randomBytes } from "node:crypto";

export const INVITE_TTL_MS = 72 * 60 * 60 * 1000;

export function createInviteToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashInviteToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function inviteExpiry(now = Date.now()): Date {
  return new Date(now + INVITE_TTL_MS);
}
