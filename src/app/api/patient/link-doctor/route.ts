import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

async function getPatientId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.userId || (session?.user as any)?.id || null;
}

// POST: Link patient to a doctor
export async function POST(req: NextRequest) {
  const patientId = await getPatientId();
  if (!patientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { doctorId } = await req.json();
  if (!doctorId) return NextResponse.json({ error: 'doctorId is required' }, { status: 400 });

  // Check doctor exists and is approved
  const { data: doctor } = await supabase
    .from('doctors')
    .select('id, name')
    .eq('id', doctorId)
    .eq('is_approved', true)
    .eq('is_active', true)
    .single();

  if (!doctor) return NextResponse.json({ error: 'Doctor not found or not approved.' }, { status: 404 });

  const { error } = await supabase
    .from('patient_doctor_links')
    .upsert({
      patient_id: patientId,
      doctor_id: doctorId,
      status: 'active',
      linked_at: new Date().toISOString(),
    }, { onConflict: 'patient_id,doctor_id' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, message: `Connected with Dr. ${doctor.name}.` });
}

// GET: Fetch patient's connected doctors
export async function GET(req: NextRequest) {
  const patientId = await getPatientId();
  if (!patientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data } = await supabase
    .from('patient_doctor_links')
    .select('doctor_id, status, linked_at, doctors:doctor_id(id, name, specialization, hospital_name, city, avatar_url)')
    .eq('patient_id', patientId)
    .eq('status', 'active');

  return NextResponse.json({ links: data || [] });
}
