import { NextRequest, NextResponse } from 'next/server';
import { updateUserPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, token } = await request.json();

    if (!email || !password || !token) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }
    if (password.length > 45) {
      return NextResponse.json(
        { error: 'Password must not exceed 45 characters' },
        { status: 400 }
      );
    }

    // Token is now validated against Supabase aihcas_reset_tokens table
    const result = await updateUserPassword(email, password, token);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update password' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Password updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
