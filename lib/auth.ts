import { cookies } from 'next/headers';
import { createHash, timingSafeEqual } from 'crypto';

const COOKIE_NAME = 'biblio_admin';

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

export function getExpectedToken(): string | null {
  const pwd = process.env.ADMIN_PASSWORD;
  if (!pwd) return null;
  return hashPassword(pwd);
}

export function isAuthenticated(): boolean {
  const expected = getExpectedToken();
  if (!expected) return false;
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    const a = Buffer.from(token, 'hex');
    const b = Buffer.from(expected, 'hex');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function setAuthCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 dias
  });
}

export function clearAuthCookie() {
  cookies().delete(COOKIE_NAME);
}

export function checkPassword(input: string): string | null {
  const pwd = process.env.ADMIN_PASSWORD;
  if (!pwd || !input) return null;
  const inputHash = hashPassword(input);
  const expected = hashPassword(pwd);
  const a = Buffer.from(inputHash, 'hex');
  const b = Buffer.from(expected, 'hex');
  if (a.length !== b.length) return null;
  return timingSafeEqual(a, b) ? inputHash : null;
}
