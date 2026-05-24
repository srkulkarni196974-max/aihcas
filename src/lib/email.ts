// Brevo (Sendinblue) transactional email helper for password reset recovery links
// Uses the HTTPS REST API (port 443) to avoid SMTP port blocks on hosting environments

export async function sendPasswordResetEmail(email: string, resetLink: string, role: string = 'patient') {
  const brevoApiKey = process.env.BREVO_API_KEY;
  const brevoSenderEmail = process.env.BREVO_SENDER_EMAIL || 'srkulkarni1969.74@gmail.com';
  const brevoSenderName = process.env.BREVO_SENDER_NAME || 'AIHCAS Healthcare';

  const isDev = process.env.NODE_ENV !== 'production';
  const isBypassEnabled = process.env.ENABLE_DEV_PASSWORD_RESET_BYPASS === 'true';

  const htmlContent = `
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
  `;

  const textContent = `Reset your AIHCAS password by visiting this link: ${resetLink}\n\nThis link expires in 1 hour.`;

  if (!brevoApiKey) {
    console.error('BREVO_API_KEY is not set in environment variables');
    
    // Trigger Dev Bypass if unconfigured
    if (isDev || isBypassEnabled) {
      logBypass(email, role, resetLink, 'Unconfigured Provider Fallback');
      return { success: true };
    }
    return { success: false, error: 'Email service not configured (missing BREVO_API_KEY)' };
  }

  try {
    console.log(`Attempting to send password reset email to ${email} via Brevo API...`);
    
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: brevoSenderName,
          email: brevoSenderEmail
        },
        to: [
          {
            email: email
          }
        ],
        subject: 'Reset Your AIHCAS Password',
        htmlContent: htmlContent,
        textContent: textContent
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.message || `HTTP error! status: ${response.status}`;
      console.error('Brevo API delivery failed:', errorMsg);
      throw new Error(errorMsg);
    }

    const responseData = await response.json();
    console.log(`Password reset email sent successfully via Brevo to ${email}, Message ID: ${responseData.messageId}`);
    return { success: true };

  } catch (error: any) {
    console.error('Failed to send email via Brevo API:', error.message);

    // Trigger Dev Bypass on failure
    if (isDev || isBypassEnabled) {
      logBypass(email, role, resetLink, `Brevo Error Fallback: ${error.message}`);
      return { success: true };
    }

    return { success: false, error: error.message };
  }
}

function logBypass(email: string, role: string, resetLink: string, reason: string) {
  console.log(`\n==================================================`);
  console.log(`[DEV PASSWORD RESET BYPASS] (${reason})`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Email: ${email}`);
  console.log(`Role: ${role}`);
  console.log(`Reset URL: ${resetLink}`);
  console.log(`==================================================\n`);
}
