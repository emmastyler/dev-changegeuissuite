-- ═══════════════════════════════════════════════════════════
-- Change Genius™ — Complete Database Schema v2
-- Run the entire file in Supabase SQL Editor
-- Safe to re-run: uses IF NOT EXISTS throughout
-- ═══════════════════════════════════════════════════════════

create extension if not exists "uuid-ossp";

-- ── PROFILES ──────────────────────────────────────────────────
create table if not exists public.profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  email              text not null,
  full_name          text,
  organization       text,
  role_level         text,
  country            text,
  role               text not null default 'individual'
                       check (role in ('individual','team_member','team_owner')),
  -- Assessment results
  change_genius_role       text,   -- primary role
  change_genius_role_2     text,   -- secondary role
  role_pair_title          text,
  primary_energy           text,
  top_adapts_stages        text[], -- array of 2 stage names
  bottom_adapts_stages     text[], -- array of 2 stage names
  -- State flags
  onboarded          boolean not null default false,
  has_paid           boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select" on public.profiles;
drop policy if exists "profiles_update" on public.profiles;

create policy "profiles_select" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ── ASSESSMENTS ───────────────────────────────────────────────
create table if not exists public.assessments (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  version      text not null default 'v1',
  status       text not null default 'in_progress'
                 check (status in ('in_progress','completed','abandoned')),
  started_at   timestamptz not null default now(),
  completed_at timestamptz,
  -- Store last answered question for resume
  last_question_index integer not null default 0
);

alter table public.assessments enable row level security;

drop policy if exists "assessments_select" on public.assessments;
drop policy if exists "assessments_insert" on public.assessments;
drop policy if exists "assessments_update" on public.assessments;

create policy "assessments_select" on public.assessments
  for select using (auth.uid() = user_id);
create policy "assessments_insert" on public.assessments
  for insert with check (auth.uid() = user_id);
create policy "assessments_update" on public.assessments
  for update using (auth.uid() = user_id);

-- ── RESPONSES ─────────────────────────────────────────────────
-- One row per question answer. Upsert on (assessment_id, question_id) for resume.
create table if not exists public.responses (
  id            uuid primary key default uuid_generate_v4(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  question_id   text not null,   -- e.g. "INNOVATOR_1"
  value         integer not null check (value between 1 and 5),
  answered_at   timestamptz not null default now(),
  unique (assessment_id, question_id)
);

alter table public.responses enable row level security;

drop policy if exists "responses_select" on public.responses;
drop policy if exists "responses_insert" on public.responses;
drop policy if exists "responses_update" on public.responses;

create policy "responses_select" on public.responses
  for select using (
    exists (select 1 from public.assessments where id = assessment_id and user_id = auth.uid())
  );
create policy "responses_insert" on public.responses
  for insert with check (
    exists (select 1 from public.assessments where id = assessment_id and user_id = auth.uid())
  );
create policy "responses_update" on public.responses
  for update using (
    exists (select 1 from public.assessments where id = assessment_id and user_id = auth.uid())
  );

-- ── SCORES ────────────────────────────────────────────────────
create table if not exists public.scores (
  assessment_id    uuid primary key references public.assessments(id) on delete cascade,
  role_scores      jsonb not null default '{}',  -- { "Innovator": 82, "Achiever": 67, ... }
  stage_scores     jsonb not null default '{}',  -- { "Alert the System": 78, ... }
  energy_scores    jsonb not null default '{}',  -- { "Spark": 85, ... }
  derived          jsonb not null default '{}',  -- primary_role, secondary_role, etc.
  calculated_at    timestamptz not null default now()
);

alter table public.scores enable row level security;

drop policy if exists "scores_select" on public.scores;
drop policy if exists "scores_insert" on public.scores;

create policy "scores_select" on public.scores
  for select using (
    exists (select 1 from public.assessments where id = assessment_id and user_id = auth.uid())
  );
create policy "scores_insert" on public.scores
  for insert with check (
    exists (select 1 from public.assessments where id = assessment_id and user_id = auth.uid())
  );
create policy "scores_update" on public.scores
  for update using (
    exists (select 1 from public.assessments where id = assessment_id and user_id = auth.uid())
  );

-- ── TEAMS ─────────────────────────────────────────────────────
create table if not exists public.teams (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  owner_id     uuid not null references public.profiles(id) on delete cascade,
  organization text,
  invite_code  text not null unique
                 default upper(substring(replace(uuid_generate_v4()::text,'-',''),1,8)),
  created_at   timestamptz not null default now()
);

alter table public.teams enable row level security;

drop policy if exists "teams_owner_all" on public.teams;
drop policy if exists "teams_members_select" on public.teams;

create policy "teams_owner_all" on public.teams
  for all using (auth.uid() = owner_id);
create policy "teams_members_select" on public.teams
  for select using (
    exists (select 1 from public.team_members where team_id = teams.id and user_id = auth.uid())
  );

-- ── TEAM MEMBERS ──────────────────────────────────────────────
create table if not exists public.team_members (
  id        uuid primary key default uuid_generate_v4(),
  team_id   uuid not null references public.teams(id) on delete cascade,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  status    text not null default 'invited'
              check (status in ('invited','joined','completed')),
  joined_at timestamptz not null default now(),
  unique (team_id, user_id)
);

alter table public.team_members enable row level security;

drop policy if exists "team_members_select_self" on public.team_members;
drop policy if exists "team_members_select_owner" on public.team_members;
drop policy if exists "team_members_insert" on public.team_members;
drop policy if exists "team_members_delete_owner" on public.team_members;

create policy "team_members_select_self" on public.team_members
  for select using (auth.uid() = user_id);
create policy "team_members_select_owner" on public.team_members
  for select using (
    exists (select 1 from public.teams where id = team_id and owner_id = auth.uid())
  );
create policy "team_members_insert" on public.team_members
  for insert with check (auth.uid() = user_id);
create policy "team_members_delete_owner" on public.team_members
  for delete using (
    exists (select 1 from public.teams where id = team_id and owner_id = auth.uid())
  );

-- ── INVITES ───────────────────────────────────────────────────
create table if not exists public.invites (
  id              uuid primary key default uuid_generate_v4(),
  team_id         uuid not null references public.teams(id) on delete cascade,
  inviter_user_id uuid not null references public.profiles(id) on delete cascade,
  email           text not null,
  token           text not null unique default encode(gen_random_bytes(24), 'hex'),
  status          text not null default 'pending'
                    check (status in ('pending','accepted','expired')),
  sent_at         timestamptz not null default now(),
  accepted_at     timestamptz
);

alter table public.invites enable row level security;

create policy "invites_owner_all" on public.invites
  for all using (auth.uid() = inviter_user_id);
create policy "invites_token_select" on public.invites
  for select using (true); -- public read for token lookup on join

-- ── TEAM REPORTS ──────────────────────────────────────────────
create table if not exists public.team_reports (
  team_id        uuid primary key references public.teams(id) on delete cascade,
  report_json    jsonb not null default '{}',
  member_count   integer not null default 0,
  risk_score     integer,       -- 0-100
  last_updated   timestamptz not null default now()
);

alter table public.team_reports enable row level security;

create policy "team_reports_owner_select" on public.team_reports
  for select using (
    exists (select 1 from public.teams where id = team_id and owner_id = auth.uid())
  );
create policy "team_reports_member_select" on public.team_reports
  for select using (
    exists (select 1 from public.team_members where team_id = team_reports.team_id and user_id = auth.uid())
  );

-- ── PULSE ENTRIES ─────────────────────────────────────────────
create table if not exists public.pulse_entries (
  pulse_id        uuid primary key default uuid_generate_v4(),
  team_id         uuid not null references public.teams(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  week_number     integer not null check (week_number > 0),
  dialogue_score  integer not null check (dialogue_score between 1 and 5),
  alignment_score integer not null check (alignment_score between 1 and 5),
  execution_score integer not null check (execution_score between 1 and 5),
  created_at      timestamptz not null default now(),
  unique (team_id, user_id, week_number)
);

alter table public.pulse_entries enable row level security;

create policy "pulse_select" on public.pulse_entries
  for select using (
    exists (select 1 from public.team_members where team_id = pulse_entries.team_id and user_id = auth.uid())
    or exists (select 1 from public.teams where id = pulse_entries.team_id and owner_id = auth.uid())
  );
create policy "pulse_insert" on public.pulse_entries
  for insert with check (auth.uid() = user_id);

-- ── PAYMENTS ──────────────────────────────────────────────────
create table if not exists public.payments (
  id                   uuid primary key default uuid_generate_v4(),
  user_id              uuid not null references public.profiles(id) on delete cascade,
  provider             text not null check (provider in ('stripe','paystack')),
  provider_reference   text not null unique,
  provider_session_id  text,
  plan                 text not null check (plan in ('individual','team')),
  team_id              uuid references public.teams(id) on delete set null,
  amount_minor         integer not null,
  currency             text not null,
  status               text not null default 'pending'
                         check (status in ('pending','completed','failed','refunded')),
  paid_at              timestamptz,
  created_at           timestamptz not null default now()
);

alter table public.payments enable row level security;

create policy "payments_owner_read" on public.payments
  for select using (auth.uid() = user_id);

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

-- ── AUTO updated_at ────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ── INDEXES ────────────────────────────────────────────────────
create index if not exists idx_assessments_user_id    on public.assessments(user_id);
create index if not exists idx_assessments_status     on public.assessments(status);
create index if not exists idx_responses_assessment   on public.responses(assessment_id);
create index if not exists idx_scores_assessment      on public.scores(assessment_id);
create index if not exists idx_team_members_team_id   on public.team_members(team_id);
create index if not exists idx_team_members_user_id   on public.team_members(user_id);
create index if not exists idx_pulse_team_week        on public.pulse_entries(team_id, week_number);
create index if not exists idx_teams_invite_code      on public.teams(invite_code);
create index if not exists idx_invites_token          on public.invites(token);
create index if not exists idx_invites_team           on public.invites(team_id);
create index if not exists idx_payments_user_id       on public.payments(user_id);
create index if not exists idx_payments_provider_ref  on public.payments(provider_reference);
