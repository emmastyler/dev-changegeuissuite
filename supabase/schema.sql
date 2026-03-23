-- ═══════════════════════════════════════════════════════════
-- Change Genius™ — Full Database Schema
-- Run in: Supabase Dashboard → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════

create extension if not exists "uuid-ossp";

-- ── PROFILES ──────────────────────────────────────────────────
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  full_name     text,
  role          text not null default 'individual'
                  check (role in ('individual','team_member','team_owner')),
  change_genius_role text,
  onboarded     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "profiles: owner read"   on public.profiles for select using (auth.uid() = id);
create policy "profiles: owner update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- ── ASSESSMENTS ───────────────────────────────────────────────
create table if not exists public.assessments (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  answers       jsonb not null default '{}',
  stage_scores  jsonb not null default '{}',
  genius_role   text,
  completed_at  timestamptz not null default now()
);

alter table public.assessments enable row level security;
create policy "assessments: owner read"   on public.assessments for select using (auth.uid() = user_id);
create policy "assessments: owner insert" on public.assessments for insert with check (auth.uid() = user_id);

-- ── TEAMS ─────────────────────────────────────────────────────
create table if not exists public.teams (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  owner_id      uuid not null references public.profiles(id) on delete cascade,
  invite_code   text not null unique
                  default upper(substring(replace(uuid_generate_v4()::text,'-',''),1,8)),
  created_at    timestamptz not null default now()
);

alter table public.teams enable row level security;
create policy "teams: owner full"   on public.teams for all using (auth.uid() = owner_id);
create policy "teams: members read" on public.teams for select using (
  exists (select 1 from public.team_members where team_id = teams.id and user_id = auth.uid())
);

-- ── TEAM MEMBERS ──────────────────────────────────────────────
create table if not exists public.team_members (
  id            uuid primary key default uuid_generate_v4(),
  team_id       uuid not null references public.teams(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  joined_at     timestamptz not null default now(),
  unique (team_id, user_id)
);

alter table public.team_members enable row level security;
create policy "team_members: self read"   on public.team_members for select using (auth.uid() = user_id);
create policy "team_members: owner read"  on public.team_members for select using (
  exists (select 1 from public.teams where id = team_id and owner_id = auth.uid())
);
create policy "team_members: self join"   on public.team_members for insert with check (auth.uid() = user_id);
create policy "team_members: owner remove" on public.team_members for delete using (
  exists (select 1 from public.teams where id = team_id and owner_id = auth.uid())
);

-- ── PULSE ENTRIES ─────────────────────────────────────────────
create table if not exists public.pulse_entries (
  pulse_id        uuid primary key default uuid_generate_v4(),
  team_id         uuid not null references public.teams(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  week_number     integer not null check (week_number > 0),
  dialogue_score  integer not null check (dialogue_score in (20,60,100)),
  alignment_score integer not null check (alignment_score in (20,60,100)),
  execution_score integer not null check (execution_score in (20,60,100)),
  created_at      timestamptz not null default now(),
  unique (team_id, user_id, week_number)
);

alter table public.pulse_entries enable row level security;
create policy "pulse: team read" on public.pulse_entries for select using (
  exists (select 1 from public.team_members where team_id = pulse_entries.team_id and user_id = auth.uid())
  or exists (select 1 from public.teams where id = pulse_entries.team_id and owner_id = auth.uid())
);
create policy "pulse: self insert" on public.pulse_entries for insert with check (auth.uid() = user_id);

-- ── AUTO-CREATE PROFILE ON SIGNUP ─────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── AUTO-UPDATE updated_at ─────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ── INDEXES ────────────────────────────────────────────────────
create index if not exists idx_assessments_user_id   on public.assessments(user_id);
create index if not exists idx_team_members_team_id  on public.team_members(team_id);
create index if not exists idx_team_members_user_id  on public.team_members(user_id);
create index if not exists idx_pulse_team_week       on public.pulse_entries(team_id, week_number);
create index if not exists idx_teams_invite_code     on public.teams(invite_code);
