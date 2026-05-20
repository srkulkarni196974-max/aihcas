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

// POST: Share a report with a connected doctor
export async function POST(req: NextRequest) {
  const patientId = await getPatientId(req);
  if (!patientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { doctorId, reportType, title, summary, aiAnalysis, anatomicalRegions, medications, labValues, triageLevel, severity, patientNotes } = body;

  if (!doctorId || !reportType || !title) {
    return NextResponse.json({ error: 'doctorId, reportType, and title are required.' }, { status: 400 });
  }

  // Verify the link exists
  const { data: link } = await supabase
    .from('patient_doctor_links')
    .select('id')
    .eq('patient_id', patientId)
    .eq('doctor_id', doctorId)
    .eq('status', 'active')
    .single();

  if (!link) return NextResponse.json({ error: 'You are not connected to this doctor.' }, { status: 403 });

  const { data, error } = await supabase
    .from('shared_reports')
    .insert({
      patient_id: patientId,
      doctor_id: doctorId,
      report_type: reportType,
      title,
      summary: summary || null,
      ai_analysis: aiAnalysis || null,
      anatomical_regions: anatomicalRegions || null,
      medications: medications || null,
      lab_values: labValues || null,
      triage_level: triageLevel || null,
      severity: severity || null,
      patient_notes: patientNotes || null,
      shared_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, report: data });
}

// GET: Fetch patient's shared reports
export async function GET(req: NextRequest) {
  const patientId = await getPatientId(req);
  if (!patientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data } = await supabase
    .from('shared_reports')
    .select('*, doctors:doctor_id(name, specialization, hospital_name)')
    .eq('patient_id', patientId)
    .order('shared_at', { ascending: false });

  return NextResponse.json({ reports: data || [] });
}
