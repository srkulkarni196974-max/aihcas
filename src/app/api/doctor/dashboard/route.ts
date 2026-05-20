import { NextRequest, NextResponse } from 'next/server';
import { verifyDoctorToken, DOCTOR_COOKIE_NAME } from '@/lib/doctor-auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET: Fetch doctor's connected patients and their reports
export async function GET(req: NextRequest) {
  const token = req.cookies.get(DOCTOR_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const session = await verifyDoctorToken(token);
  if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

  // Fetch linked patients
  const { data: links } = await supabaseAdmin
    .from('patient_doctor_links')
    .select('patient_id, status, linked_at')
    .eq('doctor_id', session.doctorId)
    .eq('status', 'active');

  if (!links || links.length === 0) {
    return NextResponse.json({ patients: [], reports: [], unreadCount: 0 });
  }

  const patientIds = links.map(l => l.patient_id);

  // Fetch patient account details (where name and email are stored for credentials & google signups)
  const { data: users } = await supabaseAdmin
    .from('aihcas_users')
    .select('id, name, email')
    .in('id', patientIds);

  // Fetch patient clinical profiles (where age, gender, blood group, medical history, etc. are stored)
  const { data: healthProfiles } = await supabaseAdmin
    .from('profiles')
    .select('id, age, gender, blood_group, medical_history, allergies')
    .in('id', patientIds);

  // Merge the account details with health profiles
  const patients = (users || []).map(u => {
    const hp = (healthProfiles || []).find(h => h.id === u.id);
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      age: hp?.age || null,
      gender: hp?.gender || null,
      blood_group: hp?.blood_group || null,
      chronic_conditions: hp?.medical_history || null,
      allergies: hp?.allergies || null,
    };
  });

  // Fetch shared reports for this doctor
  const { data: reports } = await supabaseAdmin
    .from('shared_reports')
    .select('*')
    .eq('doctor_id', session.doctorId)
    .order('shared_at', { ascending: false })
    .limit(50);

  // Count unread reports
  const unreadCount = (reports || []).filter(r => !r.is_read_by_doctor).length;

  // Fetch unread message count
  const { count: unreadMessages } = await supabaseAdmin
    .from('consultation_messages')
    .select('id', { count: 'exact', head: true })
    .eq('doctor_id', session.doctorId)
    .eq('sender_role', 'patient')
    .eq('is_read', false);

  return NextResponse.json({
    patients: patients,
    reports: reports || [],
    unreadCount,
    unreadMessages: unreadMessages || 0,
  });
}
