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
  department      text CHECK (department IN ('Computer Science and Engineering (CSE)','Electronics and Communication Engineering (ECE)','Information Technology (IT)','Mechanical Engineering (ME)','Electrical and Electronics Engineering (EEE)','Civil Engineering')),
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. HELPER: APPROVED USER CHECK
CREATE OR REPLACE FUNCTION public.is_approved_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND approval_status = 'approved'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_execom()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('execom','admin')
  );
$$;

-- 7. ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles: approved users view all profiles; users update own
CREATE POLICY "Users view own profile"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id
);

CREATE POLICY "Users update own profile"
ON public.profiles
FOR UPDATE
USING (
  auth.uid() = id
);

CREATE POLICY "Execom view all profiles"
ON public.profiles
FOR SELECT
USING (
  public.is_execom()
);

CREATE POLICY "Execom manage profiles"
ON public.profiles
FOR UPDATE
USING (
  public.is_execom()
)
WITH CHECK (
  public.is_execom()
);

-- Events: approved users read; execom CRUD all
CREATE POLICY "Approved users read events"
  ON public.events FOR SELECT
  USING (public.is_approved_user());

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

-- Registrations: approved users manage
CREATE POLICY "Approved users view registrations"
  ON public.registrations FOR SELECT
  USING (public.is_approved_user());

CREATE POLICY "Approved users create registrations"
  ON public.registrations FOR INSERT
  WITH CHECK (
    public.is_approved_user()
    AND auth.uid() = volunteer_id
  );

CREATE POLICY "Approved users delete own registrations"
  ON public.registrations FOR DELETE
  USING (
    public.is_approved_user()
    AND auth.uid() = volunteer_id
  );

-- Push subscriptions: approved users manage

CREATE POLICY "Approved users manage subscriptions"
  ON public.push_subscriptions FOR ALL
  USING (public.is_approved_user())
  WITH CHECK (public.is_approved_user());

-- 8. STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-banners', 'event-banners', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS
CREATE POLICY "Public read event banners"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-banners');

CREATE POLICY "Approved users upload event banners"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'event-banners'
    AND public.is_approved_user()
  );

CREATE POLICY "Users update own banners"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'event-banners'
    AND owner = auth.uid()
    AND public.is_approved_user()
  );

CREATE POLICY "Users delete own banners"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'event-banners'
    AND owner = auth.uid()
    AND public.is_approved_user()
  );

-- 9. INDEXES
CREATE INDEX IF NOT EXISTS idx_events_date
  ON public.events(event_date);

CREATE INDEX IF NOT EXISTS idx_registrations_event
  ON public.registrations(event_id);

CREATE INDEX IF NOT EXISTS idx_registrations_volunteer
  ON public.registrations(volunteer_id);

CREATE INDEX IF NOT EXISTS idx_profiles_approval
  ON public.profiles(approval_status);

CREATE INDEX IF NOT EXISTS idx_profiles_role
  ON public.profiles(role);

-- 10. VIEW: PUBLIC PARTICIPANT LIST (hides UUIDs and internal record IDs)
CREATE OR REPLACE VIEW public.event_participants AS
SELECT
  r.event_id,
  p.full_name,
  p.department,
  p.year
FROM registrations r
JOIN profiles p ON p.id = r.volunteer_id;
