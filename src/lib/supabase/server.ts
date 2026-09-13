import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from './client';

let supabaseServerClient: SupabaseClient | null = null;

export function getSupabaseServerClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const key = serviceRoleKey && !serviceRoleKey.includes('your-service-role-key') ? serviceRoleKey : anonKey;

  if (!key) {
    return null;
  }

  if (!supabaseServerClient) {
    supabaseServerClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      key,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }

  return supabaseServerClient;
}
