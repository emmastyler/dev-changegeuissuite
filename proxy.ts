import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Routes that require login
const REQUIRES_AUTH = ['/dashboard', '/assessment', '/results', '/teams', '/pulse', '/payment']

// Routes that redirect to dashboard if already logged in
const AUTH_ONLY = ['/login', '/signup', '/forgot-password']

// Routes that require payment on top of auth
// Note: fine-grained payment check happens in the page itself (profile.has_paid)
// Middleware only checks auth — page components handle the payment redirect
// This keeps middleware fast (no DB calls for profile)
const REQUIRES_PAYMENT = ['/assessment', '/results', '/pulse']

function secureResponse(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  }
  return response
}

function safeReturnUrl(url: string | null): string {
  if (!url) return '/dashboard'
  if (url.startsWith('//') || url.startsWith('http')) return '/dashboard'
  return url.startsWith('/') ? url : '/dashboard'
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip static assets and API routes (API routes handle their own auth)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const isProtected = REQUIRES_AUTH.some((p) => pathname.startsWith(p))
  const isAuthOnly  = AUTH_ONLY.some((p) => pathname.startsWith(p))

  if (!isProtected && !isAuthOnly) {
    return secureResponse(NextResponse.next())
  }

  // Get session server-side
  let session = null
  try {
    const res = NextResponse.next()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return req.cookies.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              res.cookies.set(name, value, options)
            )
          },
        },
      }
    )
    const { data } = await supabase.auth.getSession()
    session = data.session
  } catch {
    // Session unavailable — treat as unauthenticated
  }

  // Not logged in → send to login
  if (isProtected && !session) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('returnUrl', pathname)
    return secureResponse(NextResponse.redirect(url))
  }

  // Already logged in → redirect away from auth pages
  if (isAuthOnly && session) {
    const returnUrl = req.nextUrl.searchParams.get('returnUrl')
    const url = req.nextUrl.clone()
    url.pathname = safeReturnUrl(returnUrl)
    url.search = ''
    return secureResponse(NextResponse.redirect(url))
  }

  return secureResponse(NextResponse.next())
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
