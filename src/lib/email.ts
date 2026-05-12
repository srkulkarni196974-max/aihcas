import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'AIHCAS Healthcare <onboarding@resend.dev>',
      to: [email],
      subject: 'Reset Your AIHCAS Password',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #4DA6E8; margin: 0;">🏥 AIHCAS</h1>
            <p style="color: #64748b; font-size: 16px;">Artificial Intelligence Healthcare Assistant System</p>
          </div>
          
          <h2 style="color: #1e293b; font-size: 20px; margin-bottom: 16px;">Password Reset Request</h2>
          
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            We received a request to reset the password for your AIHCAS account. Click the button below to set a new password:
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetLink}" style="background-color: #4DA6E8; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
            If you didn't request this, you can safely ignore this email. This link will expire in 1 hour.
          </p>
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
          
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            &copy; 2026 AIHCAS Healthcare. All rights reserved.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email sending exception:', error);
    return { success: false, error };
  }
}
