import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Check if credentials are properly provided
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  supabaseUrl.trim() !== '' &&
  supabaseKey.trim() !== '' &&
  !supabaseUrl.includes('your-supabase-url')
);

if (!isSupabaseConfigured) {
  console.warn(
    '[AI-RailLink] Supabase configuration missing! Please configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env or Vercel Environment Variables.'
  );
}

// Create and export the official Supabase client
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
