const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');
const getEnvVal = (key) => {
  const line = envFile.split('\n').find(l => l.trim().startsWith(key + '='));
  if (!line) return '';
  let val = line.split('=')[1].trim();
  if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
  if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
  return val;
};

const supabaseUrl = getEnvVal('NEXT_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getEnvVal('NEXT_PUBLIC_SUPABASE_ANON_KEY');
const supabaseServiceKey = getEnvVal('SUPABASE_SERVICE_ROLE_KEY') || getEnvVal('SUPABASE_SERVICE_KEY');

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : supabase;

async function run() {
  const email = 'tejassutrave@gmail.com';
  console.log(`Checking email: ${email}`);

  // Query patient
  const { data: patient, error: pErr } = await supabase
    .from('aihcas_users')
    .select('*')
    .eq('email', email)
    .maybeSingle();
  console.log('Patient check:', patient, pErr ? pErr.message : '');

  // Query doctor
  const { data: doctor, error: dErr } = await supabaseAdmin
    .from('doctors')
    .select('*')
    .eq('email', email)
    .maybeSingle();
  console.log('Doctor check:', doctor, dErr ? dErr.message : '');
}

run();
