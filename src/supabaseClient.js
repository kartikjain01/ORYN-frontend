import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pwghoohfgjeaaumloung.supabase.co'; // ✅ FIXED
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3Z2hvb2hmZ2plYWF1bWxvdW5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NDk3MzAsImV4cCI6MjA4OTQyNTczMH0.XPsaK-TMk35JvdO3mqeQrTnsBVfVjiiW_qTu2t67ask';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'voxai-auth-token',

    // safer storage
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,

    // 🔥 important for OAuth stability
    flowType: 'pkce',
  },
});
