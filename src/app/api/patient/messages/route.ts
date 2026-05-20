import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

async function getPatientId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.userId || (session?.user as any)?.id || null;
}

// GET: Fetch messages between patient and a specific doctor
export async function GET(req: NextRequest) {
  const patientId = await getPatientId();
  if (!patientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const doctorId = searchParams.get('doctor_id');
  if (!doctorId) return NextResponse.json({ error: 'doctor_id required' }, { status: 400 });

  // Mark doctor messages as read
  await supabaseAdmin
    .from('consultation_messages')
    .update({ is_read: true })
    .eq('patient_id', patientId)
    .eq('doctor_id', doctorId)
    .eq('sender_role', 'doctor')
    .eq('is_read', false);

  const { data } = await supabaseAdmin
    .from('consultation_messages')
    .select('*')
    .eq('patient_id', patientId)
    .eq('doctor_id', doctorId)
    .order('sent_at', { ascending: true });

  return NextResponse.json({ messages: data || [] });
}

// POST: Patient sends a message to a doctor
export async function POST(req: NextRequest) {
  const patientId = await getPatientId();
  if (!patientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { doctorId, message } = await req.json();
  if (!doctorId || !message) return NextResponse.json({ error: 'doctorId and message required' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('consultation_messages')
    .insert({
      patient_id: patientId,
      doctor_id: doctorId,
      sender_role: 'patient',
      message,
      sent_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, message: data });
}
