import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/doctors/search?q=cardiology&name=sharma
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const name = searchParams.get('name') || '';

  let query = supabase
    .from('doctors')
    .select('id, name, specialization, hospital_name, city, bio, avatar_url')
    .eq('is_approved', true)
    .eq('is_active', true)
    .limit(20);

  if (q) query = query.ilike('specialization', `%${q}%`);
  if (name) query = query.ilike('name', `%${name}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ doctors: data || [] });
}
