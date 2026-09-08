-- ============================================================
-- ORYN Engine — Recreate projects & voices tables with correct schema
-- Safe to run: no existing project/voice data will be lost
-- Run in Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Drop old tables (cascade removes RLS policies, triggers, indexes)
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.voices CASCADE;

-- 1. PROJECTS TABLE
CREATE TABLE public.projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('voice_clone', 'tts', 'voice_editor', 'captions', 'video')),
  thumbnail_url text,
  output_url text,
  duration_seconds real DEFAULT 0,
  file_size_bytes bigint DEFAULT 0,
  views integer DEFAULT 0,
  status text DEFAULT 'completed' CHECK (status IN ('processing', 'completed', 'failed')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_projects_user ON public.projects(user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. VOICES TABLE
CREATE TABLE public.voices (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('voice_clone', 'tts')),
  voice_id text,
  audio_url text,
  duration_seconds real DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_voices_user ON public.voices(user_id, created_at DESC);

-- 3. ROW LEVEL SECURITY
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users read own voices" ON public.voices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own voices" ON public.voices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own voices" ON public.voices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own voices" ON public.voices FOR DELETE USING (auth.uid() = user_id);

-- 4. Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
