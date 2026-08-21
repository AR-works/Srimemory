import { createClient } from '@supabase/supabase-js';

function sanitizeSupabaseUrl(url?: string): string | undefined {
  if (!url) return undefined;
  let cleaned = url.trim().replace(/['"]/g, '');
  // Remove any trailing slashes or /rest/v1 suffixes if mistakenly pasted
  cleaned = cleaned.replace(/\/rest\/v1\/?$/, '');
  cleaned = cleaned.replace(/\/+$/, '');
  return cleaned;
}

function sanitizeSupabaseKey(key?: string): string | undefined {
  if (!key) return undefined;
  return key.trim().replace(/['"]/g, '');
}

const rawUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabaseUrl = sanitizeSupabaseUrl(rawUrl);
const supabaseKey = sanitizeSupabaseKey(rawKey);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export function getSupabaseClient() {
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
