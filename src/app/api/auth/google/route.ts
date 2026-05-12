import { NextResponse } from 'next/server';
import { authenticateGoogle } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    let email, name;
    try {
      const body = await request.json();
      email = body.email;
      name = body.name;
    } catch (e) {
      // Body might be empty
    }

    const result = await authenticateGoogle(email, name);

    return NextResponse.json(
      { user: result.user, message: 'Google login successful' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Google auth error:', error);
    return NextResponse.json(
      { error: 'Google authentication failed' },
      { status: 500 }
    );
  }
}
