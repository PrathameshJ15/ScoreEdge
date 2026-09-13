import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/client';
import { createAuthToken, hashPassword } from '@/lib/api/auth';
import { User } from '@/lib/db/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const redirectTarget = searchParams.get('redirect') || '/dashboard';
  const provider = searchParams.get('provider') || 'google';

  const defaultEmail = 'google.student@sppu.ac.in';
  let user = dbStore.users.find((u) => u.email.toLowerCase() === defaultEmail.toLowerCase());

  if (!user) {
    user = {
      id: `usr-google-${Date.now()}`,
      email: defaultEmail,
      password_hash: hashPassword('GoogleOAuth2026!'),
      full_name: 'SPPU Google Student',
      role: 'STUDENT',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      email_verified: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    dbStore.users.push(user);
  }

  const token = createAuthToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

  // Security: Prevent open redirect vulnerabilities (e.g. //evil.com, /\evil.com, javascript:)
  let safePath = '/dashboard';
  if (
    redirectTarget &&
    redirectTarget.startsWith('/') &&
    !redirectTarget.startsWith('//') &&
    !redirectTarget.includes('\\') &&
    !redirectTarget.includes(':')
  ) {
    safePath = redirectTarget;
  }

  const destination = new URL(safePath, baseUrl);

  const response = NextResponse.redirect(destination.toString());
  response.cookies.set('scoreedge_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });

  return response;
}
