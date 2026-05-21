import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// Gmail SMTP transporter — works with any Gmail + App Password, no domain needed
function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,       // e.g. yourname@gmail.com
      pass: process.env.GMAIL_APP_PASSWORD, // 16-char App Password (not your Gmail password)
    },
    connectionTimeout: 5000, // 5 seconds
    greetingTimeout: 5000,   // 5 seconds
    socketTimeout: 5000,     // 5 seconds
  });
}

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  // 1. Try Resend if API key is set
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      console.log(`Attempting to send password reset email to ${email} via Resend...`);
      const resend = new Resend(resendApiKey);
      const { data, error } = await resend.emails.send({
        from: 'AIHCAS Healthcare <onboarding@resend.dev>',
        to: email,
        subject: 'Reset Your AIHCAS Password',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #4DA6E8; margin: 0;">🏥 AIHCAS</h1>
              <p style="color: #64748b; font-size: 16px;">AI Healthcare Assistant System</p>
            </div>

            <h2 style="color: #1e293b; font-size: 20px; margin-bottom: 16px;">Password Reset Request</h2>

            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
              We received a request to reset the password for your AIHCAS account associated with <strong>${email}</strong>.
              Click the button below to set a new password:
            </p>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetLink}"
                 style="background-color: #4DA6E8; color: white; padding: 14px 32px; border-radius: 8px;
                        text-decoration: none; font-weight: bold; display: inline-block; font-size: 16px;">
                Reset My Password
              </a>
            </div>

            <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
              Or copy and paste this link into your browser:<br/>
              <a href="${resetLink}" style="color: #4DA6E8; word-break: break-all;">${resetLink}</a>
            </p>

            <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin-top: 16px;">
              ⏱️ This link will expire in <strong>1 hour</strong>.<br/>
              If you did not request a password reset, you can safely ignore this email.
            </p>

            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 28px 0;" />

            <p style="color: #94a3b8; font-size: 12px; text-align: center;">
              © 2026 AIHCAS Healthcare. All rights reserved.
            </p>
          </div>
        `,
        text: `Reset your AIHCAS password by visiting this link: ${resetLink}\n\nThis link expires in 1 hour.`,
      });

      if (error) {
        console.error('Resend delivery failed:', error);
      } else {
        console.log(`Password reset email sent successfully via Resend to ${email}, ID: ${data?.id}`);
        return { success: true };
      }
    } catch (resendError: any) {
      console.error('Resend exception, falling back to SMTP:', resendError.message);
    }
  }

  // 2. Fallback to Gmail SMTP
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass) {
    console.error('GMAIL_USER or GMAIL_APP_PASSWORD not set in .env.local');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    console.log(`Attempting to send password reset email to ${email} via Gmail SMTP...`);
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"AIHCAS Healthcare" <${gmailUser}>`,
      to: email,
      subject: 'Reset Your AIHCAS Password',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #4DA6E8; margin: 0;">🏥 AIHCAS</h1>
            <p style="color: #64748b; font-size: 16px;">AI Healthcare Assistant System</p>
          </div>

          <h2 style="color: #1e293b; font-size: 20px; margin-bottom: 16px;">Password Reset Request</h2>

          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            We received a request to reset the password for your AIHCAS account associated with <strong>${email}</strong>.
            Click the button below to set a new password:
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetLink}"
               style="background-color: #4DA6E8; color: white; padding: 14px 32px; border-radius: 8px;
                      text-decoration: none; font-weight: bold; display: inline-block; font-size: 16px;">
              Reset My Password
            </a>
          </div>

          <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
            Or copy and paste this link into your browser:<br/>
            <a href="${resetLink}" style="color: #4DA6E8; word-break: break-all;">${resetLink}</a>
          </p>

          <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin-top: 16px;">
            ⏱️ This link will expire in <strong>1 hour</strong>.<br/>
            If you did not request a password reset, you can safely ignore this email.
          </p>

          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 28px 0;" />

          <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            © 2026 AIHCAS Healthcare. All rights reserved.
          </p>
        </div>
      `,
      text: `Reset your AIHCAS password by visiting this link: ${resetLink}\n\nThis link expires in 1 hour.`,
    });

    console.log(`Password reset email sent to ${email} via Gmail SMTP`);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to send email via Gmail SMTP:', error.message);
    return { success: false, error: error.message };
  }
}
