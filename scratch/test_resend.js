const fs = require('fs');
const path = require('path');
const { Resend } = require('resend');

// Parse .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
  if (match) {
    let value = match[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[match[1]] = value;
  }
});

const resendApiKey = env.RESEND_API_KEY;

if (!resendApiKey) {
  console.error('Missing RESEND_API_KEY in .env.local');
  process.exit(1);
}

const resend = new Resend(resendApiKey);

async function testResend() {
  console.log('Sending test email via Resend...');
  try {
    const { data, error } = await resend.emails.send({
      from: 'AIHCAS Healthcare <onboarding@resend.dev>',
      to: 'srkulkarni1969.74@gmail.com',
      subject: 'Test Reset Password via Resend',
      html: '<p>If you see this, Resend integration is working perfectly!</p>',
    });

    if (error) {
      console.error('Resend error:', error);
    } else {
      console.log('Resend success:', data);
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

testResend();
