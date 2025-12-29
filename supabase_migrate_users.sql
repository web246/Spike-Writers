-- Migration: ensure `users` table has Supabase-ready columns
-- Run this in Supabase SQL editor before applying other schema changes.

-- 1) Add `auth_user_id` to link to Supabase Auth users
ALTER TABLE IF EXISTS users
  ADD COLUMN IF NOT EXISTS auth_user_id uuid UNIQUE;

-- 2) Ensure boolean `active` column exists (preferred over numeric flags)
ALTER TABLE IF NOT EXISTS users
  ADD COLUMN IF NOT EXISTS active boolean DEFAULT false;

-- 3) Ensure `joined_at` timestamp with timezone exists
ALTER TABLE IF NOT EXISTS users
  ADD COLUMN IF NOT EXISTS joined_at timestamptz;

-- 4) If you have legacy `is_active` or `created_at` values, migrate them safely
DO $$
BEGIN
  -- copy numeric is_active into boolean active
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_active') THEN
    EXECUTE 'UPDATE users SET active = (is_active = 1) WHERE active IS NULL OR active = false';
  END IF;

  -- populate joined_at from existing created_at if missing
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='created_at') THEN
    EXECUTE 'UPDATE users SET joined_at = created_at AT TIME ZONE ''UTC'' WHERE joined_at IS NULL';
  END IF;
END$$;

-- 5) Make sure created_at is timestamptz for consistency (optional)
ALTER TABLE IF EXISTS users
  ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC';

-- 6) Example admin row insertion (use only if you don't have admin user yet)
-- INSERT INTO users (role, name, email, phone, active, joined_at)
-- VALUES ('admin','Brian Webs','websitesbrian585@gmail.com', NULL, true, now())
-- ON CONFLICT (email) DO NOTHING;

-- 7) After creating the Supabase Auth user, link the auth_user_id:
-- UPDATE users SET auth_user_id = '<ADMIN_UUID>' WHERE email = 'websitesbrian585@gmail.com';

-- End migration
