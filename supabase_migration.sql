-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/hidrhdqtufhbmznkpekv/sql/new

-- 1. Users table (replaces data/users.json)
CREATE TABLE IF NOT EXISTS public.aihcas_users (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  provider    TEXT NOT NULL DEFAULT 'credentials',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Password reset tokens table
CREATE TABLE IF NOT EXISTS public.aihcas_reset_tokens (
  id         SERIAL PRIMARY KEY,
  email      TEXT NOT NULL,
  token      TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Disable RLS so server-side API routes can access freely
ALTER TABLE public.aihcas_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.aihcas_reset_tokens DISABLE ROW LEVEL SECURITY;

-- 4. Index for fast email lookups
CREATE INDEX IF NOT EXISTS aihcas_users_email_idx ON public.aihcas_users (email);
CREATE INDEX IF NOT EXISTS aihcas_reset_tokens_token_idx ON public.aihcas_reset_tokens (token);
