# Change Genius™ — MVP

A leadership intelligence platform built with **Next.js 14** and **Supabase**.

## Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend/DB**: Supabase (Auth + Postgres)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Font**: Inter (Google Fonts)

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage with Individual & Team entry cards |
| `/login` | Login / Signup with email & Google OAuth |
| `/assessment` | 60-question assessment engine (one per screen) |
| `/results` | Individual Change Genius™ results + ADAPTS profile |
| `/profile` | User profile with role & stage breakdown |
| `/teams` | My Teams list |
| `/teams/create` | Create team + invite link generation |
| `/team-map` | Team Change Map™ with radar chart + 90-day roadmap |
| `/pulse` | Weekly Change Pulse™ (3 questions, Dialogue/Alignment/Execution) |
| `/dashboard` | Executive Dashboard with Monday Change Brief™ |

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL editor
3. Enable Email and Google OAuth in Authentication settings

### 3. Configure environment
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase URL and anon key
```

### 4. Run locally
```bash
npm run dev
```

## Supabase Schema

Tables:
- `profiles` — user accounts, roles, genius roles
- `assessments` — completed assessments with answers & scores
- `teams` — teams with invite codes
- `team_members` — team membership
- `pulse_entries` — weekly pulse scores per user/team/week

Row Level Security is enabled on all tables.

## User Flow
1. Homepage → choose Individual or Team
2. Login / Sign up
3. Take 60-question assessment (8–10 min)
4. View Change Genius™ results
5. Create/join team → invite link
6. Team Change Map™ unlocks at 3/5/8 members
7. Submit Weekly Change Pulse™ (3 questions)
8. Monday Change Brief™ on Dashboard

## Navigation
Assessment · My Profile · My Teams · Team Change Map™ · Weekly Pulse · Dashboard
