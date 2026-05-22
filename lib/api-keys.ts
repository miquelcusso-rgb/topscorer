import { createHash, randomBytes } from 'crypto'
import { createServerClient } from '@/lib/supabase'

// API keys look like:  tsk_live_<32 random hex chars>
// We store ONLY the sha256 hash + a short display prefix. The plaintext key
// is shown to the user exactly once, at creation time.

const KEY_PREFIX = 'tsk_live_'

function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex')
}

export interface MintedKey {
  id: string
  plaintext: string   // show ONCE — never retrievable again
  displayPrefix: string
  label: string
}

/** Generate a new API key for a user, persisting only its hash */
export async function mintApiKey(clerkId: string, label = 'API Key'): Promise<MintedKey> {
  const secret = randomBytes(24).toString('hex')      // 48 hex chars
  const plaintext = `${KEY_PREFIX}${secret}`
  const keyHash = sha256(plaintext)
  const displayPrefix = `${KEY_PREFIX}${secret.slice(0, 6)}…`

  const sb = createServerClient()
  const { data, error } = await sb
    .from('api_keys')
    .insert({ clerk_id: clerkId, key_prefix: displayPrefix, key_hash: keyHash, label })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  return { id: data.id, plaintext, displayPrefix, label }
}

/** List a user's keys (never returns the hash or plaintext) */
export async function listApiKeys(clerkId: string) {
  const sb = createServerClient()
  const { data, error } = await sb
    .from('api_keys')
    .select('id, key_prefix, label, last_used_at, revoked, created_at')
    .eq('clerk_id', clerkId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

/** Revoke (soft-delete) a key by id, scoped to the owner */
export async function revokeApiKey(clerkId: string, keyId: string): Promise<void> {
  const sb = createServerClient()
  const { error } = await sb
    .from('api_keys')
    .update({ revoked: true })
    .eq('id', keyId)
    .eq('clerk_id', clerkId)
  if (error) throw new Error(error.message)
}

export interface VerifiedKey {
  clerkId: string
  keyId: string
}

/**
 * Verify an incoming API key (from Authorization: Bearer <key>).
 * Returns the owner's clerk_id if valid & active, else null.
 * Also stamps last_used_at (fire-and-forget).
 */
export async function verifyApiKey(plaintext: string): Promise<VerifiedKey | null> {
  if (!plaintext?.startsWith(KEY_PREFIX)) return null
  const keyHash = sha256(plaintext)

  const sb = createServerClient()
  const { data, error } = await sb
    .from('api_keys')
    .select('id, clerk_id, revoked')
    .eq('key_hash', keyHash)
    .maybeSingle()

  if (error || !data || data.revoked) return null

  // Stamp last used (don't block the request on it)
  void sb.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', data.id)

  return { clerkId: data.clerk_id, keyId: data.id }
}
