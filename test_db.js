import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Carregar variáveis do .env manualmente
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value.trim();
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

console.log('Connecting to:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log('\n--- PROFILES ---');
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('*');
  if (pErr) console.error(pErr);
  else console.table(profiles);

  console.log('\n--- MATCHES (status != scheduled) ---');
  const { data: matches, error: mErr } = await supabase.from('matches').select('*').neq('status', 'scheduled');
  if (mErr) console.error(mErr);
  else console.table(matches);

  console.log('\n--- GUESSES ---');
  const { data: guesses, error: gErr } = await supabase.from('guesses').select('*');
  if (gErr) console.error(gErr);
  else console.table(guesses);
}

test();
