import { NextRequest, NextResponse } from 'next/server';
import { DOCTOR_COOKIE_NAME } from '@/lib/doctor-auth';

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(DOCTOR_COOKIE_NAME, '', { maxAge: 0, path: '/' });
  return res;
}
