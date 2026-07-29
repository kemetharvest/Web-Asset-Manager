import crypto from 'crypto';

// Global singleton so tokens survive Next.js hot-reloads in dev and
// persist across requests within the same serverless instance on Vercel.
declare global {
  // eslint-disable-next-line no-var
  var __authTokens: Set<string> | undefined;
}

const tokens: Set<string> =
  global.__authTokens ?? (global.__authTokens = new Set<string>());

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? 'admin123';
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
