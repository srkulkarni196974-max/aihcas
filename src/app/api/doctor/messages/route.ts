import { NextRequest, NextResponse } from 'next/server';
import { verifyDoctorToken, DOCTOR_COOKIE_NAME } from '@/lib/doctor-auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET: Fetch messages between doctor and a specific patient
export async function GET(req: NextRequest) {
  const token = req.cookies.get(DOCTOR_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const session = await verifyDoctorToken(token);
  if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get('patient_id');
  if (!patientId) return NextResponse.json({ error: 'patient_id is required' }, { status: 400 });

  // Mark patient messages as read
  await supabaseAdmin
    .from('consultation_messages')
    .update({ is_read: true })
    .eq('doctor_id', session.doctorId)
    .eq('patient_id', patientId)
    .eq('sender_role', 'patient')
    .eq('is_read', false);

  const { data: messages } = await supabaseAdmin
    .from('consultation_messages')
    .select('*')
    .eq('doctor_id', session.doctorId)
    .eq('patient_id', patientId)
    .order('sent_at', { ascending: true });

  return NextResponse.json({ messages: messages || [] });
}

// POST: Doctor sends a message to a patient
export async function POST(req: NextRequest) {
  const token = req.cookies.get(DOCTOR_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const session = await verifyDoctorToken(token);
  if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

  const { patientId, message } = await req.json();
  if (!patientId || !message) return NextResponse.json({ error: 'patientId and message are required' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('consultation_messages')
    .insert({
      patient_id: patientId,
      doctor_id: session.doctorId,
      sender_role: 'doctor',
      message,
      sent_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, message: data });
}
