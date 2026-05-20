import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/biomarkers?biomarker=HbA1c
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const biomarker = searchParams.get('biomarker');
    // Optional date range – default to last 2 months
    const fromDate = new Date();
    fromDate.setMonth(fromDate.getMonth() - 2);
    const fromIso = fromDate.toISOString();

    let query = supabase
      .from('biomarker_history')
      .select('id, biomarker, value, unit, recorded_at')
      .gte('recorded_at', fromIso)
      .order('recorded_at', { ascending: true });

    if (biomarker) {
      query = query.eq('biomarker', biomarker);
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('[biomarkers API] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
