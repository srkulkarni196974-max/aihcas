-- ============================================================
-- AIHCAS Doctor-Patient Clinical Collaboration Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. DOCTORS TABLE
CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  specialization TEXT NOT NULL,
  hospital_name TEXT NOT NULL,
  organization_id TEXT,
  license_id TEXT NOT NULL,
  phone TEXT,
  city TEXT,
  bio TEXT,
  avatar_url TEXT,
  is_approved BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. PATIENT-DOCTOR LINKS (consent-based connections)
CREATE TABLE IF NOT EXISTS patient_doctor_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'revoked')),
  linked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(patient_id, doctor_id)
);

-- 3. SHARED CLINICAL REPORTS
CREATE TABLE IF NOT EXISTS shared_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('symptom_summary', 'prescription', 'lab_report', 'skin_analysis', 'full_summary')),
  title TEXT NOT NULL,
  summary TEXT,
  ai_analysis JSONB,
  anatomical_regions JSONB,
  medications JSONB,
  lab_values JSONB,
  triage_level TEXT CHECK (triage_level IN ('self', 'consult', 'emergency', null)),
  severity TEXT CHECK (severity IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL', null)),
  patient_notes TEXT,
  is_read_by_doctor BOOLEAN DEFAULT false,
  shared_at TIMESTAMPTZ DEFAULT now()
);

-- 4. DOCTOR-PATIENT CHAT THREADS
CREATE TABLE IF NOT EXISTS consultation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('patient', 'doctor')),
  message TEXT NOT NULL,
  attachment_url TEXT,
  attachment_type TEXT,
  is_read BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ DEFAULT now()
);

-- ── Indexes for fast lookups ─────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_patient_doctor_links_patient ON patient_doctor_links(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_doctor_links_doctor ON patient_doctor_links(doctor_id);
CREATE INDEX IF NOT EXISTS idx_shared_reports_doctor ON shared_reports(doctor_id);
CREATE INDEX IF NOT EXISTS idx_shared_reports_patient ON shared_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultation_messages_thread ON consultation_messages(patient_id, doctor_id);

-- ── Row Level Security ────────────────────────────────────────
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_doctor_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_messages ENABLE ROW LEVEL SECURITY;

-- Public can read approved doctor profiles for search
CREATE POLICY "Public can view approved doctors"
  ON doctors FOR SELECT
  USING (is_approved = true AND is_active = true);

-- Patients can read their own links
CREATE POLICY "Patients can view own links"
  ON patient_doctor_links FOR SELECT
  USING (auth.uid() = patient_id);

-- Patients can insert links
CREATE POLICY "Patients can create links"
  ON patient_doctor_links FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

-- Patients can share reports
CREATE POLICY "Patients can share reports"
  ON shared_reports FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

-- Patients can view their own shared reports
CREATE POLICY "Patients can view own reports"
  ON shared_reports FOR SELECT
  USING (auth.uid() = patient_id);

-- Patients can send messages
CREATE POLICY "Patients can send messages"
  ON consultation_messages FOR INSERT
  WITH CHECK (auth.uid() = patient_id AND sender_role = 'patient');

-- Patients can view their own messages
CREATE POLICY "Patients can view own messages"
  ON consultation_messages FOR SELECT
  USING (auth.uid() = patient_id);
