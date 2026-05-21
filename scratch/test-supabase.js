const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const getEnvVal = (key) => {
  const line = envFile.split('\n').find(l => l.startsWith(key + '='));
  return line ? line.split('=')[1].trim() : '';
};

const supabaseUrl = getEnvVal('NEXT_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getEnvVal('NEXT_PUBLIC_SUPABASE_ANON_KEY');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const tables = [
  'aihcas_users',
  'biomarker_history',
  'biomarkers',
  'doctors',
  'patient_doctor_links',
  'shared_reports',
  'consultation_messages',
  'medical_documents',
  'profiles'
];

async function checkTable(table) {
  try {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`Table "${table}": Error - ${error.message} (${error.code})`);
    } else {
      console.log(`Table "${table}": Success, returned ${data.length} row(s)`);
    }
  } catch (err) {
    console.log(`Table "${table}": Throw - ${err.message}`);
  }
}

async function run() {
  for (const t of tables) {
    await checkTable(t);
  }
}

run();
