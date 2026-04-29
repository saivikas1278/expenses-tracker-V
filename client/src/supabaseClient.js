import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseAnonKey === 'REPLACE_WITH_SUPABASE_ANON_KEY'
) {
  throw new Error(
    'Supabase env is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in client/.env and restart Vite.'
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
