const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Standard anonymous client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTests() {
  console.log('--- STARTING PASSWORD RESET TESTS ---');

  // Find a doctor in the doctors table
  // We can query doctors table. Since public policy allows viewing approved, let's see if we can find any doctor.
  const { data: doctors, error: docError } = await supabase
    .from('doctors')
    .select('id, name, email, is_approved, is_active')
    .limit(5);

  if (docError) {
    console.error('Failed to query doctors:', docError);
  } else {
    console.log(`Found ${doctors.length} doctors:`, doctors.map(d => d.email));
  }

  // Choose a doctor or create/use a test one
  const testDoctorEmail = doctors && doctors.length > 0 ? doctors[0].email : 'srkulkarni1969.74@gmail.com';
  console.log(`Testing with doctor email: ${testDoctorEmail}`);

  // 1. Send Forgot Password POST request
  console.log('Sending forgot-password request...');
  const resetRes = await fetch('http://localhost:3000/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testDoctorEmail }),
  });
  
  console.log(`Forgot-password response status: ${resetRes.status}`);
  const resetData = await resetRes.json();
  console.log('Forgot-password response data:', resetData);

  // 2. Query aihcas_reset_tokens to verify token creation and fetch the token
  const { data: tokens, error: tokenError } = await supabase
    .from('aihcas_reset_tokens')
    .select('*')
    .eq('email', testDoctorEmail)
    .order('created_at', { ascending: false })
    .limit(1);

  if (tokenError) {
    console.error('Failed to query reset tokens:', tokenError);
    process.exit(1);
  }

  if (!tokens || tokens.length === 0) {
    console.error('No reset token found in the database!');
    process.exit(1);
  }

  const latestToken = tokens[0];
  console.log('Successfully found reset token in database:', {
    email: latestToken.email,
    token: latestToken.token,
    expires_at: latestToken.expires_at,
    used: latestToken.used,
  });

  // 3. Test update password POST request
  const newPassword = 'newSecretPassword123';
  console.log(`Resetting password to: ${newPassword} using token...`);
  const updateRes = await fetch('http://localhost:3000/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testDoctorEmail,
      password: newPassword,
      token: latestToken.token,
    }),
  });

  console.log(`Reset-password response status: ${updateRes.status}`);
  const updateData = await updateRes.json();
  console.log('Reset-password response data:', updateData);

  // 4. Verify token was marked as used
  const { data: verifiedToken } = await supabase
    .from('aihcas_reset_tokens')
    .select('used')
    .eq('token', latestToken.token)
    .single();

  console.log(`Token used status in DB: ${verifiedToken?.used}`);
  if (verifiedToken?.used === true) {
    console.log('✅ TEST PASSED SUCCESSFUL!');
  } else {
    console.error('❌ TEST FAILED: Token was not marked as used!');
  }
}

runTests().catch(err => {
  console.error('Test error:', err);
});
