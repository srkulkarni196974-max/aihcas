-- ==============================================================================
-- AIHCAS Biomarker History Table Migration & Schema Alignments
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/hidrhdqtufhbmznkpekv/sql/new
-- ==============================================================================

-- 1. Create the table if it doesn't exist yet
CREATE TABLE IF NOT EXISTS public.biomarker_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add columns safely to make sure they are present regardless of table creation order
ALTER TABLE public.biomarker_history ADD COLUMN IF NOT EXISTS biomarker TEXT;
ALTER TABLE public.biomarker_history ADD COLUMN IF NOT EXISTS value NUMERIC;
ALTER TABLE public.biomarker_history ADD COLUMN IF NOT EXISTS unit TEXT;
ALTER TABLE public.biomarker_history ADD COLUMN IF NOT EXISTS recorded_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.biomarker_history ADD COLUMN IF NOT EXISTS biomarker_name TEXT;
ALTER TABLE public.biomarker_history ADD COLUMN IF NOT EXISTS biomarker_value NUMERIC;
ALTER TABLE public.biomarker_history ADD COLUMN IF NOT EXISTS normal_range TEXT;
ALTER TABLE public.biomarker_history ADD COLUMN IF NOT EXISTS report_date TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.biomarker_history ADD COLUMN IF NOT EXISTS report_reference TEXT;

-- 3. Perform the same setup for the 'biomarkers' table name
CREATE TABLE IF NOT EXISTS public.biomarkers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.biomarkers ADD COLUMN IF NOT EXISTS biomarker TEXT;
ALTER TABLE public.biomarkers ADD COLUMN IF NOT EXISTS value NUMERIC;
ALTER TABLE public.biomarkers ADD COLUMN IF NOT EXISTS unit TEXT;
ALTER TABLE public.biomarkers ADD COLUMN IF NOT EXISTS recorded_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.biomarkers ADD COLUMN IF NOT EXISTS biomarker_name TEXT;
ALTER TABLE public.biomarkers ADD COLUMN IF NOT EXISTS biomarker_value NUMERIC;
ALTER TABLE public.biomarkers ADD COLUMN IF NOT EXISTS normal_range TEXT;
ALTER TABLE public.biomarkers ADD COLUMN IF NOT EXISTS report_date TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.biomarkers ADD COLUMN IF NOT EXISTS report_reference TEXT;

-- 4. Disable Row Level Security (RLS) to match standard platform behavior
ALTER TABLE public.biomarker_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.biomarkers DISABLE ROW LEVEL SECURITY;

-- 5. Indexes for high-performance dashboard lookups
CREATE INDEX IF NOT EXISTS idx_biomarker_history_user ON public.biomarker_history(user_id);
CREATE INDEX IF NOT EXISTS idx_biomarker_history_biomarker_name ON public.biomarker_history(biomarker_name);
CREATE INDEX IF NOT EXISTS idx_biomarkers_user ON public.biomarkers(user_id);
CREATE INDEX IF NOT EXISTS idx_biomarkers_biomarker_name ON public.biomarkers(biomarker_name);
