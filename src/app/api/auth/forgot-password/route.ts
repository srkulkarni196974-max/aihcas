import { NextRequest, NextResponse } from 'next/server';
import { forgotPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    const result = await forgotPassword(email.trim());

    if (!result.success) {
      return NextResponse.json(
        { error: result.message || 'Failed to send password reset email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: result.message },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
