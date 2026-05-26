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
  console.log("Fetching latest report document from medical_documents...");
  const { data, error } = await supabase
    .from('medical_documents')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error("Error fetching document:", error.message);
    return;
  }

  if (!data || data.length === 0) {
    console.log("No documents found in database.");
    return;
  }

  const doc = data[0];
  console.log("\n==================================================");
  console.log("DOCUMENT DETAILS:");
  console.log("ID:", doc.id);
  console.log("Name:", doc.name);
  console.log("Type:", doc.type);
  console.log("Created At:", doc.created_at);
  console.log("==================================================");
  console.log("ANALYSIS JSON:");
  console.log(JSON.stringify(doc.analysis_json, null, 2));
  console.log("==================================================");
}

run();
