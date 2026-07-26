-- Anipendant Schema Migration
-- Run this in the Supabase SQL Editor

-- 1. Enable pgcrypto for password/pin hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Users table (public, extends auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  pin_hash TEXT,
  pin_security_question TEXT,
  pin_security_answer_hash TEXT,
  selected_api TEXT NOT NULL DEFAULT 'anilist'
    CHECK (selected_api IN ('anilist', 'jikan', 'kitsu')),
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Auto-create public.user row on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Shows table
CREATE TABLE public.shows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  api_source TEXT NOT NULL CHECK (api_source IN ('anilist', 'jikan', 'kitsu')),
  api_id TEXT NOT NULL,
  title TEXT NOT NULL,
  image_url TEXT,
  synopsis TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, api_source, api_id)
);

-- 5. Episodes table
CREATE TABLE public.episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  show_id UUID NOT NULL REFERENCES public.shows(id) ON DELETE CASCADE,
  episode_number INTEGER NOT NULL CHECK (episode_number > 0),
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(show_id, episode_number)
);

-- 6. Episode mirrors table
CREATE TABLE public.episode_mirrors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id UUID NOT NULL REFERENCES public.episodes(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episode_mirrors ENABLE ROW LEVEL SECURITY;

-- Users: can read/update own profile; allow login lookup by username
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (id = auth.uid() OR (username IS NOT NULL));

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (id = auth.uid());

-- Shows: full CRUD for own shows only
CREATE POLICY "shows_select_own" ON public.shows
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "shows_insert_own" ON public.shows
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "shows_update_own" ON public.shows
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "shows_delete_own" ON public.shows
  FOR DELETE USING (user_id = auth.uid());

-- Episodes: via show ownership
CREATE POLICY "episodes_select_own" ON public.episodes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.shows WHERE id = show_id AND user_id = auth.uid())
  );

CREATE POLICY "episodes_insert_own" ON public.episodes
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.shows WHERE id = show_id AND user_id = auth.uid())
  );

CREATE POLICY "episodes_delete_own" ON public.episodes
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.shows WHERE id = show_id AND user_id = auth.uid())
  );

-- Episode Mirrors: via episode → show ownership chain
CREATE POLICY "mirrors_select_own" ON public.episode_mirrors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.episodes e
      JOIN public.shows s ON e.show_id = s.id
      WHERE e.id = episode_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "mirrors_insert_own" ON public.episode_mirrors
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.episodes e
      JOIN public.shows s ON e.show_id = s.id
      WHERE e.id = episode_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "mirrors_delete_own" ON public.episode_mirrors
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.episodes e
      JOIN public.shows s ON e.show_id = s.id
      WHERE e.id = episode_id AND s.user_id = auth.uid()
    )
  );

-- 8. PIN verification function (RPC)
CREATE OR REPLACE FUNCTION public.verify_pin(p_user_id UUID, p_pin TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  stored_hash TEXT;
BEGIN
  SELECT pin_hash INTO stored_hash
  FROM public.users
  WHERE id = p_user_id;

  RETURN stored_hash = crypt(p_pin, stored_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Update last_activity helper
CREATE OR REPLACE FUNCTION public.update_last_activity(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.users
  SET last_activity = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Update PIN function
CREATE OR REPLACE FUNCTION public.update_pin(
  p_user_id UUID,
  p_current_pin TEXT,
  p_new_pin TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  current_hash TEXT;
BEGIN
  SELECT pin_hash INTO current_hash
  FROM public.users
  WHERE id = p_user_id;

  -- Verify current PIN
  IF current_hash IS NOT NULL AND current_hash != crypt(p_current_pin, current_hash) THEN
    RETURN FALSE;
  END IF;

  -- Update to new PIN
  UPDATE public.users
  SET pin_hash = crypt(p_new_pin, gen_salt('bf'))
  WHERE id = p_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
