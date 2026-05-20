import { NextRequest, NextResponse } from 'next/server';
import { loginDoctor, DOCTOR_COOKIE_NAME } from '@/lib/doctor-auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const { token, doctor } = await loginDoctor(email, password);

    const res = NextResponse.json({
      success: true,
      doctor: {
        id: doctor.id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        hospitalName: doctor.hospital_name,
        isApproved: doctor.is_approved,
        avatarUrl: doctor.avatar_url,
      },
    });

    res.cookies.set(DOCTOR_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Login failed.' }, { status: 401 });
  }
}
