# Change Genius™ — Next.js Application

## Stack
- **Framework**: Next.js 16 (App Router, TypeScript)
- **Auth/DB**: Supabase (Auth + Postgres + RLS)
- **Validation**: Zod (all form schemas)
- **Forms**: React Hook Form + @hookform/resolvers
- **HTTP**: Axios (with auth interceptors)
- **State**: React Context (auth) + TanStack Query ready
- **Styling**: CSS Variables matching cg-v8.html design exactly

---

## Quick Start

### 1. Create Supabase project
1. Go to [supabase.com](https://supabase.com) → New project
2. SQL Editor → run `supabase/schema.sql` in full
3. Authentication → Settings:
   - Enable **Email** provider
   - Enable **Google** OAuth (add Client ID + Secret from Google Cloud Console)
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

### 2. Environment
```bash
cp .env.example .env.local
# Fill in your Supabase URL and anon key
```

### 3. Install & run
```bash
npm install
npm run dev
```

---

## Auth Features (Production-ready)

| Feature | Implementation |
|---|---|
| Email/password signup | Zod schema, strength meter, email confirmation |
| Email/password login | Client-side rate limiting (5 attempts / 15 min) |
| Google OAuth | PKCE flow via Supabase |
| Forgot password | Email enumeration prevention (always shows success) |
| Reset password | Token-based via Supabase magic link |
| Route protection | Next.js middleware with session validation |
| Security headers | X-Frame-Options, NOSNIFF, CSP, HSTS (prod) |
| Session management | Auto-refresh, real-time state sync |
| Email confirmation | Redirect to assessment after confirm |

---

## Routes

| Route | Auth | Description |
|---|---|---|
| `/` | Public | Full homepage (exact cg-v8 design) |
| `/login` | Redirect if authed | Login with email or Google |
| `/signup` | Redirect if authed | Signup with password strength meter |
| `/forgot-password` | Public | Password reset request |
| `/auth/callback` | Internal | OAuth + email confirmation handler |
| `/auth/reset-password` | Internal | New password form |
| `/dashboard` | Protected | User dashboard with quick actions |
| `/assessment` | Protected | Assessment entry point |
| `/results` | Protected | ADAPTS profile results |
| `/teams` | Protected | Team management |
| `/pulse` | Protected | Weekly Change Pulse™ |
| `/about` | Public | About page |
| `/pricing` | Public | Pricing page |

---

## File Structure

```
app/
├── page.tsx              ← Homepage (exact cg-v8 design)
├── layout.tsx            ← Root layout with AuthProvider
├── globals.css           ← CSS vars + animations from cg-v8
├── login/page.tsx        ← Login form
├── signup/page.tsx       ← Signup with password strength
├── forgot-password/      ← Forgot password
├── auth/
│   ├── callback/route.ts ← OAuth + email callback handler
│   └── reset-password/   ← New password page
├── dashboard/page.tsx    ← Protected dashboard
├── assessment/page.tsx   ← Assessment entry
├── results/page.tsx      ← Results view
├── teams/page.tsx        ← Teams
├── pulse/page.tsx        ← Weekly pulse
├── about/page.tsx        ← About
└── pricing/page.tsx      ← Pricing

components/auth/
├── AuthShell.tsx         ← Shared auth page wrapper + shared styles

hooks/
└── useAuth.tsx           ← AuthProvider + useAuth hook

lib/
├── supabase.ts           ← Browser client singleton
├── auth.ts               ← All auth operations (signUp, signIn, OAuth, etc.)
└── schemas.ts            ← Zod validation schemas

middleware.ts             ← Route protection + security headers
supabase/schema.sql       ← Full DB schema with RLS
```

---

## Building on the Dashboard

The `/dashboard` page is intentionally simple — a clean starting point.
To add features, extend `app/dashboard/page.tsx` with:
- Monday Change Brief™ (fetch pulse data)
- Team Change Map™ preview
- Assessment history
- Weekly trend chart (recharts is already installable)

---

## Security Checklist

- [x] All passwords validated by Zod (min 8, uppercase, lowercase, number)
- [x] Client-side rate limiting on sign-in
- [x] Email enumeration prevention on forgot-password
- [x] Open redirect prevention in login returnUrl
- [x] PKCE OAuth flow (not implicit)
- [x] Security headers on all responses (middleware)
- [x] RLS enabled on all Supabase tables
- [x] Service role key never exposed to browser
- [x] Auto-refresh tokens, forced logout on expired session
- [x] No sensitive data in localStorage (Supabase manages tokens)
