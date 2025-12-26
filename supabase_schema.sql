-- Supabase schema for Spark Writers
-- Run this in your Supabase SQL editor to create the `users` table.

create table if not exists users (
  id bigserial primary key,
  email text unique not null,
  name text,
  role text,
  joined_at date,
  active boolean default true,
  auth_user_id text
);

-- Insert demo admin profile (you should create a Supabase Auth user first and then set auth_user_id)
-- Replace the email and name as needed. If you use Supabase Auth, add auth_user_id returned by Auth signup.

insert into users (email, name, role, joined_at, active) values ('websitesbrian585@gmail.com', 'Brian Webs', 'admin', now()::date, true);
