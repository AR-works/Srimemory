import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export const SESSION_COOKIE_NAME = 's_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const SESSION_SECRET = process.env.SESSION_SECRET || 's_bday_secret_salt_key_2024_secure';

/**
 * Hash a PIN with SHA-256 and salt.
 */
export function hashPin(pin: string, salt: string = 's_bday_salt'): string {
  return crypto.createHmac('sha256', salt).update(pin.trim()).digest('hex');
}

/**
 * Validate entered PIN against configured hash or fallback.
 */
export function verifyPin(enteredPin: string): boolean {
  if (!enteredPin) return false;
  const trimmed = enteredPin.trim();

  // 1. If explicit hash is set in env
  const expectedHash = process.env.S_PIN_HASH;
  if (expectedHash) {
    const salt = process.env.S_PIN_SALT || 's_bday_salt';
    const computedHash = hashPin(trimmed, salt);
    return computedHash === expectedHash;
  }

  // 2. If plaintext PIN is set in env
  const envPin = process.env.S_PIN;
  if (envPin) {
    return trimmed === envPin.trim();
  }

  // 3. Default fallback PIN for development: '22082005'
  return trimmed === '22082005';
}

/**
 * Generate a signed session token.
 */
export function createSessionToken(): string {
  const payload = {
    role: 'S',
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_MAX_AGE * 1000,
  };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
  return `${data}.${signature}`;
}

/**
 * Verify a session token string.
 */
export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [data, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');

  if (signature !== expectedSig) return false;

  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8'));
    if (payload.role !== 'S') return false;
    if (Date.now() > payload.expiresAt) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Helper to check S authentication in Server Components or Route Handlers.
 */
export function isSAuthenticated(): boolean {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(sessionCookie);
}

/**
 * Helper to check S authentication from NextRequest.
 */
export function isSAuthenticatedFromRequest(request: NextRequest): boolean {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}
