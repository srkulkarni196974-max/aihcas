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

async function run() {
  console.log("Fetching last 5 documents...");
  const { data, error } = await supabase
    .from('medical_documents')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error:", error.message);
    return;
  }

  for (let i = 0; i < data.length; i++) {
    const doc = data[i];
    console.log(`\nDoc [${i}]: ID=${doc.id}, Name=${doc.name}, Created=${doc.created_at}`);
    // Check if results has suspicious values
    if (doc.analysis_json && doc.analysis_json.results) {
      console.log("Parsed values:");
      doc.analysis_json.results.forEach(r => {
        console.log(`  - ${r.name}: value=${r.value}, range=${JSON.stringify(r.range)}`);
      });
    }
  }
}

run();
