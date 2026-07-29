/**
 * Simple token-based admin auth.
 * Tokens are stored in memory and invalidated on server restart.
 */
import crypto from "crypto";

const tokens = new Set<string>();

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "admin123";
}

export function validatePassword(password: string): boolean {
  return password === getAdminPassword();
}

export function createToken(): string {
  const token = crypto.randomUUID();
  tokens.add(token);
  return token;
}

export function validateToken(token: string | undefined): boolean {
  if (!token) return false;
  return tokens.has(token);
}

export function extractToken(authHeader: string | undefined): string | undefined {
  if (!authHeader) return undefined;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : undefined;
}
