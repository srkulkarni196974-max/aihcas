import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET(request: NextRequest) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  // 1. Check env vars are loaded
  if (!gmailUser || !gmailPass || gmailUser === 'your_gmail@gmail.com') {
    return NextResponse.json({
      status: 'error',
      step: 'env_check',
      message: 'GMAIL_USER or GMAIL_APP_PASSWORD not set or still has placeholder values',
      gmailUser: gmailUser || 'NOT SET',
      gmailPassLength: gmailPass?.length || 0,
    });
  }

  // 2. Try creating transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: gmailUser, pass: gmailPass },
  });

  // 3. Verify SMTP connection
  try {
    await transporter.verify();
  } catch (verifyErr: any) {
    return NextResponse.json({
      status: 'error',
      step: 'smtp_verify',
      message: `Gmail SMTP connection failed: ${verifyErr.message}`,
      hint: verifyErr.message.includes('Username and Password not accepted')
        ? 'App Password is wrong OR Gmail 2FA is not enabled. Visit: https://myaccount.google.com/apppasswords'
        : verifyErr.message,
    });
  }

  // 4. Send a real test email to the same Gmail account
  try {
    await transporter.sendMail({
      from: `"AIHCAS Test" <${gmailUser}>`,
      to: gmailUser, // send to self as test
      subject: '✅ AIHCAS Email Test',
      text: 'This is a test email from AIHCAS. If you receive this, password reset emails will work.',
    });

    return NextResponse.json({
      status: 'success',
      message: `Test email sent to ${gmailUser}. Check your inbox!`,
    });
  } catch (sendErr: any) {
    return NextResponse.json({
      status: 'error',
      step: 'send_email',
      message: `Email send failed: ${sendErr.message}`,
    });
  }
}
