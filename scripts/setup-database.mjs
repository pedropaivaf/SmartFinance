import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = 'https://uebwjpfutqvtotjpiulp.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlYndqcGZ1dHF2dG90anBpdWxwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDY2Mzg3NCwiZXhwIjoyMDg2MjM5ODc0fQ.fjz2W6-KhPVuXdMFUvVcOhpCSVWmW4TGyeDlfkpcHNo';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  db: { schema: 'public' },
  auth: { persistSession: false, autoRefreshToken: false },
});

const sql = readFileSync(join(__dirname, 'setup-database.sql'), 'utf-8');

// Split into statements and run each
const statements = sql
  .split(/;\s*$/m)
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

async function run() {
  console.log('Setting up SmartFinance database...\n');

  for (const stmt of statements) {
    const firstLine = stmt.split('\n').find(l => l.trim() && !l.trim().startsWith('--')) || stmt.slice(0, 60);
    console.log(`Running: ${firstLine.trim().slice(0, 80)}...`);

    const { error } = await supabase.rpc('exec_sql', { sql_query: stmt + ';' });
    if (error) {
      // Try via raw fetch to the pg endpoint
      console.log(`  RPC not available, this SQL must be run manually in Supabase Dashboard.`);
    } else {
      console.log('  OK');
    }
  }

  console.log('\nDone! If some statements failed, copy scripts/setup-database.sql');
  console.log('and paste it in Supabase Dashboard > SQL Editor > New Query > Run');
}

run().catch(console.error);
