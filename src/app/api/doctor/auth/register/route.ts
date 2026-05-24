import { NextRequest, NextResponse } from 'next/server';
import { registerDoctor } from '@/lib/doctor-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, specialization, hospitalName, organizationId, licenseId, phone, city, bio } = body;

    if (!name || !email || !password || !specialization || !hospitalName || !licenseId) {
      return NextResponse.json({ error: 'All required fields must be provided.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }
    if (password.length > 45) {
      return NextResponse.json({ error: 'Password must not exceed 45 characters.' }, { status: 400 });
    }

    const doctor = await registerDoctor({ name, email, password, specialization, hospitalName, organizationId, licenseId, phone, city, bio });

    return NextResponse.json({
      success: true,
      message: 'Registration submitted. Your account is pending admin approval.',
      doctorId: doctor.id,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Registration failed.' }, { status: 400 });
  }
}
