-- ============================================================
-- NSS Unit 185 — Volunteer Management Portal
-- Run this entire script in the Supabase SQL Editor
-- ============================================================

-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES (extends auth.users)
CREATE TABLE public.profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           text,
  full_name       text,
  department      text CHECK (department IN ('CSE','ECE','MECH','CIVIL','EEE','OTHER')),
  year            text CHECK (year IN ('Year 1','Year 2','Year 3','Year 4')),
  avatar_url      text,
  role            text NOT NULL DEFAULT 'volunteer'
                  CHECK (role IN ('volunteer','execom','admin')),
  approval_status text NOT NULL DEFAULT 'pending'
                  CHECK (approval_status IN ('pending','approved','rejected')),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- 2. EVENTS (listings)
CREATE TABLE public.events (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title                 text NOT NULL,
  description           text,
  location              text,
  event_date            timestamptz NOT NULL,
  registration_deadline timestamptz,
  max_slots             integer NOT NULL DEFAULT 30,
  image_url             text,
  emoji                 text,
  status                text NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active','closed','cancelled')),
  created_by            uuid REFERENCES public.profiles(id),
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

-- 3. REGISTRATIONS
CREATE TABLE public.registrations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  volunteer_id  uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at     timestamptz DEFAULT now(),
  UNIQUE(event_id, volunteer_id)
);

-- 4. PUSH SUBSCRIPTIONS
CREATE TABLE public.push_subscriptions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  subscription  jsonb NOT NULL,
  created_at    timestamptz DEFAULT now()
);

-- 5. AUTO-CREATE PROFILE ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles: users read own; execom read all; users update own
CREATE POLICY "Users view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('execom','admin')
  ));

CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Events: anyone can read active; execom CRUD all
CREATE POLICY "Anyone read active events"
  ON public.events FOR SELECT
  USING (status = 'active' OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('execom','admin')
  ));

CREATE POLICY "Execom insert events"
  ON public.events FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('execom','admin')
  ));

CREATE POLICY "Execom update events"
  ON public.events FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('execom','admin')
  ));

CREATE POLICY "Execom delete events"
  ON public.events FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('execom','admin')
  ));

-- Registrations: volunteers manage own; execom read all
CREATE POLICY "Volunteers manage own registrations"
  ON public.registrations FOR ALL
  USING (auth.uid() = volunteer_id)
  WITH CHECK (auth.uid() = volunteer_id);

CREATE POLICY "Execom view all registrations"
  ON public.registrations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('execom','admin')
  ));

-- Push subscriptions: users manage own
CREATE POLICY "Users manage own push subs"
  ON public.push_subscriptions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7. STORAGE BUCKET (run separately in Storage UI or via SQL)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('event-banners', 'event-banners', true);
--
-- Storage RLS:
-- CREATE POLICY "Public read event banners"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'event-banners');
--
-- CREATE POLICY "Execom upload event banners"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'event-banners'
--     AND EXISTS (
--       SELECT 1 FROM public.profiles
--       WHERE id = auth.uid() AND role IN ('execom','admin')
--     )
--   );
