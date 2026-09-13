import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const redirectPath = searchParams.get('redirect') || '/dashboard';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${baseUrl}/api/auth/oauth/callback?redirect=${encodeURIComponent(redirectPath)}`,
        },
      });

      if (!error && data.url) {
        return NextResponse.redirect(data.url);
      }
    }
  }

  // Fallback / local dev OAuth simulation
  const callbackUrl = new URL(`${baseUrl}/api/auth/oauth/callback`);
  callbackUrl.searchParams.set('provider', 'google');
  callbackUrl.searchParams.set('code', `google_oauth_${Date.now()}`);
  callbackUrl.searchParams.set('redirect', redirectPath);

  return NextResponse.redirect(callbackUrl.toString());
}
