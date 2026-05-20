const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

async function main() {
  try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const env = {};
    envContent.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join('=').trim().replace(/(^"|"$)/g, '');
        env[key] = val;
      }
    });

    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('\n--- All users in aihcas_users ---');
    const { data: users, error: userErr } = await supabase
      .from('aihcas_users')
      .select('*');
    
    if (userErr) {
      console.error(userErr);
    } else {
      console.log(JSON.stringify(users, null, 2));
    }

    console.log('\n--- All profiles ---');
    const { data: profiles, error: profErr } = await supabase
      .from('profiles')
      .select('*');
    
    if (profErr) {
      console.error(profErr);
    } else {
      console.log(JSON.stringify(profiles, null, 2));
    }

    console.log('\n--- Consultation Messages count ---');
    const { data: messages } = await supabase.from('consultation_messages').select('patient_id, sender_role, message');
    console.log(messages);
  } catch (err) {
    console.error(err);
  }
}

main();
