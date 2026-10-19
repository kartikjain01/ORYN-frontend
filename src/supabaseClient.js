import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (
  !supabaseUrl ||
  !supabaseAnonKey ||
  !supabaseUrl.startsWith('https://') ||
  supabaseUrl.includes('REPLACE')
) {
  throw new Error(
    'Missing or invalid Supabase environment variables.\n' +
    'Open the .env file in the project root and set:\n' +
    '  VITE_SUPABASE_URL=https://<your-project-id>.supabase.co\n' +
    '  VITE_SUPABASE_ANON_KEY=<your-anon-public-key>\n' +
    'Get these from: Supabase Dashboard → Settings → API.\n' +
    'Then restart Vite (Ctrl+C, npm run dev).'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storageKey: 'oryn-auth-token',

    // safer storage
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,

    // 🔥 important for OAuth stability
    flowType: 'pkce',
  },
});
