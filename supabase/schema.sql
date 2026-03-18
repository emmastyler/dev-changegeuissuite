-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  role text check (role in ('individual', 'team_member', 'team_owner')) default 'individual',
  change_genius_role text,
  created_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Assessments
create table assessments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  answers jsonb not null,
  stage_scores jsonb not null,
  genius_role text not null,
  completed_at timestamptz default now()
);
alter table assessments enable row level security;
create policy "Users can view own assessments" on assessments for select using (auth.uid() = user_id);
create policy "Users can insert own assessments" on assessments for insert with check (auth.uid() = user_id);

-- Teams
create table teams (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  owner_id uuid references profiles(id) on delete cascade,
  invite_code text unique not null default upper(substring(replace(uuid_generate_v4()::text, '-', ''), 1, 8)),
  created_at timestamptz default now()
);
alter table teams enable row level security;
create policy "Team owner full access" on teams for all using (auth.uid() = owner_id);
create policy "Team members can view" on teams for select using (
  exists (select 1 from team_members where team_id = teams.id and user_id = auth.uid())
);

-- Team members
create table team_members (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references teams(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  unique(team_id, user_id)
);
alter table team_members enable row level security;
create policy "Team members visible to team" on team_members for select using (
  auth.uid() = user_id or
  exists (select 1 from teams where id = team_id and owner_id = auth.uid())
);
create policy "Users can join teams" on team_members for insert with check (auth.uid() = user_id);

-- Pulse entries
create table pulse_entries (
  pulse_id uuid default uuid_generate_v4() primary key,
  team_id uuid references teams(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  week_number integer not null,
  dialogue_score integer check (dialogue_score in (20, 60, 100)),
  alignment_score integer check (alignment_score in (20, 60, 100)),
  execution_score integer check (execution_score in (20, 60, 100)),
  created_at timestamptz default now(),
  unique(team_id, user_id, week_number)
);
alter table pulse_entries enable row level security;
create policy "Team members can view pulse" on pulse_entries for select using (
  exists (select 1 from team_members where team_id = pulse_entries.team_id and user_id = auth.uid()) or
  exists (select 1 from teams where id = pulse_entries.team_id and owner_id = auth.uid())
);
create policy "Users can insert own pulse" on pulse_entries for insert with check (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
