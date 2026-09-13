import { scryptSync, randomBytes, timingSafeEqual, createHmac } from 'node:crypto';
import { dbStore } from '@/lib/db/client';
import { User, UserRole } from '@/lib/db/types';

const TOKEN_SECRET = process.env.AUTH_SECRET || 'scoreedge_secret_jwt_signing_key_secure_2026';

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

export function verifyPassword(password: string, combinedHash: string): boolean {
  try {
    const [salt, key] = combinedHash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = scryptSync(password, salt, 64);
    return timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

export function createAuthToken(user: { id: string; email: string; role: UserRole }): string {
  const payload = Buffer.from(
    JSON.stringify({
      id: user.id,
      email: user.email,
      role: user.role,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    })
  ).toString('base64url');

  const signature = createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function verifyAuthToken(token: string): { id: string; email: string; role: UserRole } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payload, signature] = parts;
    const expectedSignature = createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
    
    const sigBuffer = Buffer.from(signature, 'utf-8');
    const expBuffer = Buffer.from(expectedSignature, 'utf-8');
    if (sigBuffer.length !== expBuffer.length || !timingSafeEqual(sigBuffer, expBuffer)) {
      return null;
    }

    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    if (data.exp && Date.now() > data.exp) return null;
    return { id: data.id, email: data.email, role: data.role };
  } catch {
    return null;
  }
}

export function createPasswordResetToken(email: string): string {
  const token = randomBytes(32).toString('hex');
  const expires_at = Date.now() + 60 * 60 * 1000; // 1 hour expiration
  dbStore.passwordResets = dbStore.passwordResets.filter((pr) => pr.email.toLowerCase() !== email.toLowerCase());
  dbStore.passwordResets.push({
    email: email.toLowerCase(),
    token,
    expires_at,
  });
  return token;
}

export function verifyPasswordResetToken(token: string): { email: string } | null {
  const record = dbStore.passwordResets.find(
    (pr) => pr.token === token && pr.expires_at > Date.now()
  );
  if (!record) return null;
  return { email: record.email };
}

export function consumePasswordResetToken(token: string): string | null {
  const index = dbStore.passwordResets.findIndex(
    (pr) => pr.token === token && pr.expires_at > Date.now()
  );
  if (index === -1) return null;
  const email = dbStore.passwordResets[index].email;
  dbStore.passwordResets.splice(index, 1);
  return email;
}

export function getAuthUser(request: Request): User | null {
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
  let token: string | null = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  }

  if (!token) {
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(/scoreedge_token=([^;]+)/);
    if (match) {
      token = decodeURIComponent(match[1]);
    }
  }

  if (!token) return null;

  const payload = verifyAuthToken(token);
  if (!payload) return null;

  const user = dbStore.users.find((u) => u.id === payload.id && u.is_active && !u.deleted_at);
  return user || null;
}

export function requireRole(
  request: Request,
  allowedRoles: UserRole[] = ['STUDENT', 'ADMIN', 'REVIEWER']
): {
  user: User | null;
  authorized: boolean;
  errorReason?: string;
} {
  const user = getAuthUser(request);
  if (!user) {
    return { user: null, authorized: false, errorReason: 'Authentication required' };
  }

  if (!allowedRoles.includes(user.role)) {
    return { user, authorized: false, errorReason: 'Insufficient permissions' };
  }

  return { user, authorized: true };
}

export function requireAdmin(request: Request): {
  user: User | null;
  authorized: boolean;
  errorReason?: string;
} {
  return requireRole(request, ['ADMIN']);
}

