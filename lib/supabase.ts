import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

let _client: ReturnType<typeof createBrowserClient> | null = null

export function getSupabase() {
  if (typeof window === 'undefined') return createBrowserClient(supabaseUrl, supabaseAnonKey)
  if (!_client) _client = createBrowserClient(supabaseUrl, supabaseAnonKey)
  return _client
}

export type UserRole = 'individual' | 'team_member' | 'team_owner'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  change_genius_role: string | null
  onboarded: boolean
  has_paid: boolean
  created_at: string
  updated_at: string
}
