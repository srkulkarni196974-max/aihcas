-- ==============================================================================
-- AIHCAS Biomarker History Table Migration
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/hidrhdqtufhbmznkpekv/sql/new
-- ==============================================================================

-- 1. Create the biomarker_history table supporting both legacy and requested schemas
CREATE TABLE IF NOT EXISTS public.biomarker_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  
  -- Legacy Columns
  biomarker TEXT,
  value NUMERIC,
  unit TEXT,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),

  -- New User-Requested Columns
  biomarker_name TEXT,
  biomarker_value NUMERIC,
  normal_range TEXT,         -- Stores the JSON-stringified range (e.g. "[12, 17.5]")
  report_date TIMESTAMPTZ DEFAULT NOW(),
  report_reference TEXT,     -- Reference file name (e.g. "report_demo.jpg")
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Disable Row Level Security (RLS) to match standard platform behavior
ALTER TABLE public.biomarker_history DISABLE ROW LEVEL SECURITY;

-- 3. Indexes for high-performance dashboard lookups
CREATE INDEX IF NOT EXISTS idx_biomarker_history_user ON public.biomarker_history(user_id);
CREATE INDEX IF NOT EXISTS idx_biomarker_history_biomarker ON public.biomarker_history(biomarker);
CREATE INDEX IF NOT EXISTS idx_biomarker_history_biomarker_name ON public.biomarker_history(biomarker_name);
CREATE INDEX IF NOT EXISTS idx_biomarker_history_recorded_at ON public.biomarker_history(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_biomarker_history_report_date ON public.biomarker_history(report_date DESC);
