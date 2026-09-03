-- ============================================================
-- ORYN Engine — Supabase Schema
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. PROJECTS TABLE
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  type text not null check (type in ('voice_clone', 'tts', 'voice_editor', 'captions', 'video')),
  thumbnail_url text,
  output_url text,
  duration_seconds real default 0,
  file_size_bytes bigint default 0,
  views integer default 0,
  status text default 'completed' check (status in ('processing', 'completed', 'failed')),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_projects_user on public.projects(user_id, created_at desc);

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
  before update on public.projects
  for each row execute function public.handle_updated_at();

-- 2. VOICES TABLE
create table if not exists public.voices (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('voice_clone', 'tts')),
  voice_id text,
  audio_url text,
  duration_seconds real default 0,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_voices_user on public.voices(user_id, created_at desc);

-- 3. ROW LEVEL SECURITY
alter table public.projects enable row level security;
alter table public.voices enable row level security;

create policy "Users read own projects" on public.projects for select using (auth.uid() = user_id);
create policy "Users insert own projects" on public.projects for insert with check (auth.uid() = user_id);
create policy "Users update own projects" on public.projects for update using (auth.uid() = user_id);
create policy "Users delete own projects" on public.projects for delete using (auth.uid() = user_id);

create policy "Users read own voices" on public.voices for select using (auth.uid() = user_id);
create policy "Users insert own voices" on public.voices for insert with check (auth.uid() = user_id);
create policy "Users update own voices" on public.voices for update using (auth.uid() = user_id);
create policy "Users delete own voices" on public.voices for delete using (auth.uid() = user_id);
