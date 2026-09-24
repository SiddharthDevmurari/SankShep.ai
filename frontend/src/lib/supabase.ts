import { createClient } from '@supabase/supabase-js'

/**
 * The single central Supabase project for Sankshep.ai.
 *
 * These values are pinned in source on purpose: every clone of the repo, on
 * every machine, must talk to the same database. `.env` files are gitignored
 * and so cannot guarantee that. The publishable key is designed to ship in
 * client bundles — data access is enforced by Row Level Security policies
 * (see supabase/schema.sql), not by keeping this key secret.
 */
export const SUPABASE_URL = 'https://onhqpaqqwsdnuxwkxksh.supabase.co'
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_LCU-9w178iUjqA7haajEwg_3phnRL-W'

/** Must match public.admin_email() in supabase/schema.sql. */
export const ADMIN_EMAIL = 'admin@gmail.com'

/** Shared demo account, created by supabase/schema.sql. Must match public.demo_email(). */
export const DEMO_EMAIL = 'demo@sankshep.ai'
export const DEMO_PASSWORD = 'demo123'

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // no email links are used
    storageKey: 'sankshep-auth',
  },
})

/** Postgres/PostgREST codes meaning schema.sql hasn't been run yet. */
export function isMissingSchemaError(err: { code?: string } | null | undefined): boolean {
  return err?.code === 'PGRST205' || err?.code === '42P01' || err?.code === 'PGRST202'
}
