import { NextRequest, NextResponse } from 'next/server';
import { verifyDoctorToken, DOCTOR_COOKIE_NAME } from '@/lib/doctor-auth';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(DOCTOR_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ doctor: null }, { status: 401 });

  const session = await verifyDoctorToken(token);
  if (!session) return NextResponse.json({ doctor: null }, { status: 401 });

  // Fetch fresh doctor record from DB
  const { data: doctor } = await supabase
    .from('doctors')
    .select('id, name, email, specialization, hospital_name, city, bio, avatar_url, is_approved, is_active, license_id, organization_id')
    .eq('id', session.doctorId)
    .single();

  if (!doctor || !doctor.is_active) return NextResponse.json({ doctor: null }, { status: 401 });

  return NextResponse.json({ doctor });
}
