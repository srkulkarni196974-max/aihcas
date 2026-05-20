import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

async function getPatientId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.userId || (session?.user as any)?.id || null;
}

// POST: Share a report with a connected doctor
export async function POST(req: NextRequest) {
  const patientId = await getPatientId();
  if (!patientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { doctorId, reportType, title, summary, aiAnalysis, anatomicalRegions, medications, labValues, triageLevel, severity, patientNotes } = body;

  if (!doctorId || !reportType || !title) {
    return NextResponse.json({ error: 'doctorId, reportType, and title are required.' }, { status: 400 });
  }

  // Verify the link exists
  const { data: link } = await supabaseAdmin
    .from('patient_doctor_links')
    .select('id')
    .eq('patient_id', patientId)
    .eq('doctor_id', doctorId)
    .eq('status', 'active')
    .single();

  if (!link) return NextResponse.json({ error: 'You are not connected to this doctor.' }, { status: 403 });

  const { data, error } = await supabaseAdmin
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

  // Automatically post a notification in consultation_messages
  try {
    const displayType = reportType === 'full_summary' ? 'Full Summary' : reportType.replace(/_/g, ' ');
    const notificationText = `System Notification: I have shared a new clinical report: "${title}" (${displayType}). Please review it in the Shared Reports tab.`;
    await supabaseAdmin
      .from('consultation_messages')
      .insert({
        patient_id: patientId,
        doctor_id: doctorId,
        sender_role: 'patient',
        message: notificationText,
        sent_at: new Date().toISOString(),
      });
  } catch (msgErr) {
    console.error("Error creating automated consultation message notification:", msgErr);
  }

  return NextResponse.json({ success: true, report: data });
}

// GET: Fetch patient's shared reports
export async function GET(req: NextRequest) {
  const patientId = await getPatientId();
  if (!patientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data } = await supabaseAdmin
    .from('shared_reports')
    .select('*, doctors:doctor_id(name, specialization, hospital_name)')
    .eq('patient_id', patientId)
    .order('shared_at', { ascending: false });

  return NextResponse.json({ reports: data || [] });
}
