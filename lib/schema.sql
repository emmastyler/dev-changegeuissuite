-- ============================================================
-- Change Genius™ Supabase Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  change_genius_role text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- ASSESSMENTS
-- ============================================================
create table if not exists assessments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  answers jsonb not null default '{}',
  alert_score integer default 0,
  diagnose_score integer default 0,
  readiness_score integer default 0,
  dialogue_score integer default 0,
  alignment_score integer default 0,
  scale_score integer default 0,
  primary_role text,
  secondary_role text,
  completed_at timestamptz default now()
);

alter table assessments enable row level security;

create policy "Users can view own assessments"
  on assessments for select using (auth.uid() = user_id);

create policy "Users can insert own assessments"
  on assessments for insert with check (auth.uid() = user_id);

-- ============================================================
-- TEAMS
-- ============================================================
create table if not exists teams (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  owner_id uuid references profiles(id) on delete cascade not null,
  invite_code text unique default substring(md5(random()::text), 1, 8),
  created_at timestamptz default now()
);

alter table teams enable row level security;

create policy "Team members can view teams"
  on teams for select using (
    auth.uid() = owner_id or
    exists (select 1 from team_members where team_id = teams.id and user_id = auth.uid())
  );

create policy "Owners can insert teams"
  on teams for insert with check (auth.uid() = owner_id);

-- ============================================================
-- TEAM MEMBERS
-- ============================================================
create table if not exists team_members (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references teams(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  role text check (role in ('owner', 'member')) default 'member',
  joined_at timestamptz default now(),
  unique(team_id, user_id)
);

alter table team_members enable row level security;

create policy "Members can view team memberships"
  on team_members for select using (
    auth.uid() = user_id or
    exists (select 1 from team_members tm where tm.team_id = team_members.team_id and tm.user_id = auth.uid())
  );

create policy "Users can join teams"
  on team_members for insert with check (auth.uid() = user_id);

-- ============================================================
-- PULSE ENTRIES
-- ============================================================
create table if not exists pulse_entries (
  pulse_id uuid default uuid_generate_v4() primary key,
  team_id uuid references teams(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  week_number integer not null,
  dialogue_score integer check (dialogue_score in (20, 60, 100)),
  alignment_score integer check (alignment_score in (20, 60, 100)),
  execution_score integer check (execution_score in (20, 60, 100)),
  created_at timestamptz default now(),
  unique(team_id, user_id, week_number)
);

alter table pulse_entries enable row level security;

create policy "Team members can view pulse entries"
  on pulse_entries for select using (
    exists (select 1 from team_members where team_id = pulse_entries.team_id and user_id = auth.uid())
  );

create policy "Team members can insert pulse entries"
  on pulse_entries for insert with check (
    auth.uid() = user_id and
    exists (select 1 from team_members where team_id = pulse_entries.team_id and user_id = auth.uid())
  );
