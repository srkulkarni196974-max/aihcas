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

  // Fetch patient profiles
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('id, name, email, age, gender, blood_group, chronic_conditions, allergies')
    .in('id', patientIds);

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
    patients: profiles || [],
    reports: reports || [],
    unreadCount,
    unreadMessages: unreadMessages || 0,
  });
}
