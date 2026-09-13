import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const TOKEN_SECRET = process.env.AUTH_SECRET || 'scoreedge_secret_jwt_signing_key_secure_2026';

async function verifyToken(
  token: string
): Promise<{ id: string; email: string; role: string; exp?: number } | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payloadBase64, signature] = parts;

    // Cryptographic HMAC-SHA256 signature verification in Edge Runtime
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(TOKEN_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const sigBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadBase64));
    const sigArray = new Uint8Array(sigBuffer);

    let binary = '';
    for (let i = 0; i < sigArray.byteLength; i++) {
      binary += String.fromCharCode(sigArray[i]);
    }
    const expectedSig = btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Constant-time timing attack protection
    if (signature.length !== expectedSig.length) return null;
    let diff = 0;
    for (let i = 0; i < signature.length; i++) {
      diff |= signature.charCodeAt(i) ^ expectedSig.charCodeAt(i);
    }
    if (diff !== 0) return null;

    const normalizedBase64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(normalizedBase64);
    const data = JSON.parse(decoded);
    if (data.exp && Date.now() > data.exp) return null;
    return data;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Extract auth token from cookie or Authorization header
  let token = request.cookies.get('scoreedge_token')?.value;

  if (!token) {
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    }
  }

  const payload = token ? await verifyToken(token) : null;

  // 1. Protect Admin API endpoints
  if (pathname.startsWith('/api/admin')) {
    if (!payload) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }
    if (payload.role !== 'ADMIN') {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Admin role required' } },
        { status: 403 }
      );
    }
    return NextResponse.next();
  }

  // 2. Protect Admin dashboard UI
  if (pathname.startsWith('/admin')) {
    if (!payload) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (payload.role !== 'ADMIN') {
      const dashboardUrl = new URL('/dashboard', request.url);
      dashboardUrl.searchParams.set('error', 'unauthorized_admin_access');
      return NextResponse.redirect(dashboardUrl);
    }
    return NextResponse.next();
  }

  // 3. Protect Student dashboard UI
  if (pathname.startsWith('/dashboard')) {
    if (!payload) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 4. Redirect logged-in users away from /login and /signup
  if (pathname === '/login' || pathname === '/signup') {
    if (payload) {
      const target = payload.role === 'ADMIN' ? '/admin' : '/dashboard';
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/api/admin/:path*', '/login', '/signup'],
};
