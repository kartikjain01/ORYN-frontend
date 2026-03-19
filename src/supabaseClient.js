import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pwghoohfgjeaaumloung.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3Z2hvb2hmZ2plYWF1bWxvdW5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NDk3MzAsImV4cCI6MjA4OTQyNTczMH0.XPsaK-TMk35JvdO3mqeQrTnsBVfVjiiW_qTu2t67ask';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,       // Keeps user logged in after closing the tab
    autoRefreshToken: true,     // Automatically refreshes the login token
    detectSessionInUrl: true,   // Essential for catching the "Email Verified" link
    storageKey: 'voxai-auth-token', // Custom key to avoid conflicts with other apps
    storage: window.localStorage,   // Explicitly use localStorage for persistence
  },
});