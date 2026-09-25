/**
 * Custom audience profiles a user saves to their account. Stored in the
 * Supabase auth user's metadata, so they follow the account to any device
 * without a database table.
 */

import { supabase } from './supabase'
import type { Audience } from './pipeline'

const METADATA_KEY = 'audience_profiles'
export const MAX_SAVED_AUDIENCES = 8

/** Metadata is user-editable JSON; keep only well-formed profiles, within the form's own limits. */
function clean(value: unknown): Audience[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((a): a is Audience => typeof a?.name === 'string' && typeof a?.description === 'string' && !!a.name.trim())
    .map((a) => ({ name: a.name.trim().slice(0, 80), description: a.description.trim().slice(0, 600) }))
    .slice(0, MAX_SAVED_AUDIENCES)
}

export async function fetchSavedAudiences(): Promise<Audience[]> {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw new Error(error.message)
  return clean(data.user?.user_metadata?.[METADATA_KEY])
}

async function store(list: Audience[]): Promise<Audience[]> {
  const { data, error } = await supabase.auth.updateUser({ data: { [METADATA_KEY]: list } })
  if (error) throw new Error(error.message)
  return clean(data.user?.user_metadata?.[METADATA_KEY])
}

const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()

/** Saves a profile, replacing one with the same name. Returns the stored list and whether it replaced one. */
export async function saveAudience(current: Audience[], profile: Audience): Promise<{ list: Audience[]; replaced: boolean }> {
  const entry = { name: profile.name.trim(), description: profile.description.trim() }
  const replaced = current.some((a) => sameName(a.name, entry.name))
  if (!replaced && current.length >= MAX_SAVED_AUDIENCES) {
    throw new Error(`You can keep up to ${MAX_SAVED_AUDIENCES} saved profiles. Remove one first.`)
  }
  const next = replaced ? current.map((a) => (sameName(a.name, entry.name) ? entry : a)) : [...current, entry]
  return { list: await store(next), replaced }
}

export async function removeAudience(current: Audience[], name: string): Promise<Audience[]> {
  return store(current.filter((a) => !sameName(a.name, name)))
}
