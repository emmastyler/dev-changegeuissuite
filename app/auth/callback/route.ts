import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type') // 'signup' | 'oauth' | 'recovery'
  const error = searchParams.get('error')
  const errorDesc = searchParams.get('error_description')

  if (error) {
    console.error('[Auth callback]', error, errorDesc)
    return NextResponse.redirect(`${origin}/login?error=oauth_error`)
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    console.error('[Auth callback] Exchange failed:', exchangeError.message)
    return NextResponse.redirect(`${origin}/login?error=callback_failed`)
  }

  // Determine redirect destination
  let dest = '/dashboard'
  if (type === 'signup') dest = '/payment?plan=individual&welcome=1'
  if (type === 'recovery') dest = '/auth/reset-password'

  const response = NextResponse.redirect(`${origin}${dest}`)
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  return response
}
