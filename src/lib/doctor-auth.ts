/**
 * Doctor authentication utilities
 * Separate from patient auth — doctors have their own JWT session
 */
import { supabase, supabaseAdmin } from './supabase';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const DOCTOR_JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'doctor-secret-fallback'
);
const COOKIE_NAME = 'doctor_session';

export interface DoctorSession {
  doctorId: string;
  name: string;
  email: string;
  specialization: string;
  hospitalName: string;
  isApproved: boolean;
}

// ── Register a new doctor ──────────────────────────────────────
export async function registerDoctor(data: {
  name: string;
  email: string;
  password: string;
  specialization: string;
  hospitalName: string;
  organizationId?: string;
  licenseId: string;
  phone?: string;
  city?: string;
  bio?: string;
}) {
  // Check if email already exists
  const { data: existing } = await supabaseAdmin
    .from('doctors')
    .select('id')
    .eq('email', data.email)
    .single();

  if (existing) throw new Error('A doctor account with this email already exists.');

  const passwordHash = await bcrypt.hash(data.password, 12);

  const { data: doctor, error } = await supabaseAdmin
    .from('doctors')
    .insert({
      name: data.name,
      email: data.email,
      password_hash: passwordHash,
      specialization: data.specialization,
      hospital_name: data.hospitalName,
      organization_id: data.organizationId || null,
      license_id: data.licenseId,
      phone: data.phone || null,
      city: data.city || null,
      bio: data.bio || null,
      is_approved: false, // Requires admin approval
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return doctor;
}

// ── Login a doctor ─────────────────────────────────────────────
export async function loginDoctor(email: string, password: string) {
  const { data: doctor, error } = await supabaseAdmin
    .from('doctors')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !doctor) throw new Error('Invalid email or password.');

  const isValid = await bcrypt.compare(password, doctor.password_hash);
  if (!isValid) throw new Error('Invalid email or password.');

  if (!doctor.is_active) throw new Error('Your account has been deactivated.');

  const token = await new SignJWT({
    doctorId: doctor.id,
    name: doctor.name,
    email: doctor.email,
    specialization: doctor.specialization,
    hospitalName: doctor.hospital_name,
    isApproved: doctor.is_approved,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(DOCTOR_JWT_SECRET);

  return { token, doctor };
}

// ── Verify doctor session from cookie value ─────────────────────
export async function verifyDoctorToken(token: string): Promise<DoctorSession | null> {
  try {
    const { payload } = await jwtVerify(token, DOCTOR_JWT_SECRET);
    return payload as unknown as DoctorSession;
  } catch {
    return null;
  }
}

export { COOKIE_NAME as DOCTOR_COOKIE_NAME };
