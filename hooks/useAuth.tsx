'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import { getSupabase } from '@/lib/supabase'
import type { Profile } from '@/lib/supabase'
import { getProfile } from '@/lib/auth'

interface AuthCtx {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  isAuthenticated: boolean
  refetchProfile: () => Promise<void>
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchProfile(uid: string): Promise<void> {
    const p = await getProfile(uid)
    setProfile(p)
  }

  async function refetchProfile(): Promise<void> {
    if (user?.id) await fetchProfile(user.id)
  }

  useEffect(() => {
    const sb = getSupabase()

    // Bootstrap: get current session
    void sb.auth.getSession().then(
      ({ data }: { data: { session: Session | null } }) => {
        const s = data.session
        setSession(s)
        setUser(s?.user ?? null)
        if (s?.user) {
          void fetchProfile(s.user.id).finally(() => setLoading(false))
        } else {
          setLoading(false)
        }
      }
    )

    // Listen for auth state changes
    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange(
      (event: AuthChangeEvent, s: Session | null) => {
        setSession(s)
        setUser(s?.user ?? null)
        if (s?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          void fetchProfile(s.user.id)
        }
        if (event === 'SIGNED_OUT') setProfile(null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Ctx.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isAuthenticated: !!session,
        refetchProfile,
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
