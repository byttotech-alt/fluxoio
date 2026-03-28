import { createClient } from '@supabase/supabase-js';
import pkg from 'dotenv';
pkg.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkSchema() {
  const { data, error } = await supabase.from('profiles').select('id').limit(1);
  if (error) {
    if (error.code === '42P01') {
      console.log('SCHEMA_NOT_APPLIED');
    } else {
      console.log('ERROR', error);
    }
  } else {
    console.log('SCHEMA_APPLIED');
  }
}

checkSchema();
