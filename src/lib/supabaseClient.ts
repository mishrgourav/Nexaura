import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Cache client instance
let supabaseClientInstance: SupabaseClient | null = null;

/**
 * Normalizes Supabase URL by stripping any /rest/v1 or trailing slashes
 * so that Supabase Auth endpoints (/auth/v1/...) hit the correct origin.
 */
export function normalizeSupabaseUrl(url?: string): string {
  if (!url) return '';
  let cleaned = url.trim();
  // Remove /rest/v1 or /rest/v1/ from the end if present
  cleaned = cleaned.replace(/\/rest\/v1\/?$/, '');
  // Remove any trailing slashes
  cleaned = cleaned.replace(/\/+$/, '');
  return cleaned;
}

/**
 * Initializes and returns the Supabase client.
 * First checks environment variables, then falls back to /api/auth/config.
 */
export async function getSupabaseClient(): Promise<SupabaseClient | null> {
  if (supabaseClientInstance) {
    return supabaseClientInstance;
  }

  // 1. Try Vite client environment variables
  const metaEnv = (import.meta as any)?.env || {};
  const envUrl = normalizeSupabaseUrl(metaEnv.VITE_SUPABASE_URL as string);
  const envKey = (metaEnv.VITE_SUPABASE_ANON_KEY as string) || '';

  if (envUrl && envKey) {
    console.log('[Supabase Client] Initialized using Vite client environment variables at:', envUrl);
    supabaseClientInstance = createClient(envUrl, envKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    return supabaseClientInstance;
  }

  // 2. Fetch server-provided config from /api/auth/config
  try {
    const res = await fetch('/api/auth/config');
    if (res.ok) {
      const config = await res.json();
      const serverUrl = normalizeSupabaseUrl(config.supabaseUrl);
      const serverKey = config.supabaseAnonKey;

      if (serverUrl && serverKey) {
        console.log('[Supabase Client] Initialized using /api/auth/config at:', serverUrl);
        supabaseClientInstance = createClient(serverUrl, serverKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
          },
        });
        return supabaseClientInstance;
      }
    }
  } catch (err) {
    console.warn('[Supabase Client] Failed to fetch server auth config:', err);
  }

  console.warn('[Supabase Client] Supabase client could not be initialized (no URL/Key provided)');
  return null;
}
