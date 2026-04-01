'use client'
import { getSupabase } from './supabase'
import type { Profile } from './supabase'

// Client-side rate limiting
const attempts = new Map<string, { count: number; last: number }>()
const MAX = 5
const WINDOW = 15 * 60 * 1000

function checkRate(email: string): { ok: boolean; wait?: number } {
  const now = Date.now()
  const r = attempts.get(email)
  if (!r) return { ok: true }
  if (now - r.last > WINDOW) { attempts.delete(email); return { ok: true } }
  if (r.count >= MAX) return { ok: false, wait: Math.ceil((WINDOW - (now - r.last)) / 60000) }
  return { ok: true }
}
function recordAttempt(email: string, success: boolean) {
  if (success) { attempts.delete(email); return }
  const now = Date.now()
  const r = attempts.get(email) ?? { count: 0, last: now }
  attempts.set(email, { count: r.count + 1, last: now })
}

function sanitize(msg: string): string {
  const map: Record<string, string> = {
    'User already registered': 'An account with this email already exists.',
    'Email not confirmed': 'Please confirm your email before signing in.',
    'Invalid login credentials': 'Invalid email or password.',
    'Email rate limit exceeded': 'Too many requests. Please wait and try again.',
  }
  return map[msg] ?? 'Something went wrong. Please try again.'
}

// ── SIGN UP ──────────────────────────────────────────────────
export async function signUp(data: { full_name: string; email: string; password: string }) {
  const sb = getSupabase()
  const { data: res, error } = await sb.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: { full_name: data.full_name },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?type=signup`,
    },
  })
  if (error) return { error: sanitize(error.message) }
  return { data: res, confirmSent: !res.session }
}

// ── SIGN IN ──────────────────────────────────────────────────
export async function signIn(data: { email: string; password: string }) {
  const rate = checkRate(data.email)
  if (!rate.ok) return { error: `Too many attempts. Try again in ${rate.wait} minute(s).` }

  const sb = getSupabase()
  const { data: res, error } = await sb.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })
  if (error) {
    recordAttempt(data.email, false)
    return { error: 'Invalid email or password.' }
  }
  recordAttempt(data.email, true)
  return { data: res }
}

// ── GOOGLE OAUTH ─────────────────────────────────────────────
export async function signInWithGoogle() {
  const sb = getSupabase()
  const { data, error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?type=oauth`,
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  })
  if (error) return { error: 'OAuth sign-in failed.' }
  return { url: data.url }
}

// ── SIGN OUT ─────────────────────────────────────────────────
export async function signOut() {
  const sb = getSupabase()
  await sb.auth.signOut()
  if (typeof window !== 'undefined') localStorage.clear()
}

// ── FORGOT PASSWORD ──────────────────────────────────────────
export async function forgotPassword(email: string) {
  const sb = getSupabase()
  // Always resolve — never reveal whether email exists
  await sb.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?type=recovery`,
  })
  return { ok: true }
}

// ── RESET PASSWORD ───────────────────────────────────────────
export async function resetPassword(password: string) {
  const sb = getSupabase()
  const { error } = await sb.auth.updateUser({ password })
  if (error) return { error: 'Reset failed. The link may have expired.' }
  return { ok: true }
}

// ── GET SESSION ──────────────────────────────────────────────
export async function getSession() {
  const sb = getSupabase()
  const { data: { session } } = await sb.auth.getSession()
  return session
}

// ── GET PROFILE ──────────────────────────────────────────────
export async function getProfile(userId: string): Promise<Profile | null> {
  const sb = getSupabase()
  const { data } = await sb.from('profiles').select('*').eq('id', userId).single()
  return data as Profile | null
}
