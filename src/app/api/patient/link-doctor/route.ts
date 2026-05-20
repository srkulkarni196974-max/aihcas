import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback');

async function getPatientId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('session')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return (payload as any).userId || null;
  } catch { return null; }
}

// POST: Link patient to a doctor
export async function POST(req: NextRequest) {
  const patientId = await getPatientId(req);
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
  const patientId = await getPatientId(req);
  if (!patientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data } = await supabase
    .from('patient_doctor_links')
    .select('doctor_id, status, linked_at, doctors:doctor_id(id, name, specialization, hospital_name, city, avatar_url)')
    .eq('patient_id', patientId)
    .eq('status', 'active');

  return NextResponse.json({ links: data || [] });
}
