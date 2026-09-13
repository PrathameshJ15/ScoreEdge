import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /dashboard and all /dashboard/:path* routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    const token = request.cookies.get('scoreedge_token')?.value;

    // If no token cookie is present
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(loginUrl);
    }

    try {
      const parts = token.split('.');
      if (parts.length !== 2) {
        throw new Error('Invalid token structure');
      }
      const data = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf-8'));
      if (data.exp && Date.now() > data.exp) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        loginUrl.searchParams.set('error', 'session_expired');
        const res = NextResponse.redirect(loginUrl);
        res.cookies.delete('scoreedge_token');
        return res;
      }

      // Check admin role requirement
      if (pathname.startsWith('/admin') && data.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('error', 'unauthorized');
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete('scoreedge_token');
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/dashboard', '/admin/:path*', '/admin'],
};
