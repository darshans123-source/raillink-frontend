import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_KEY ||
  ''
).trim();

// Check if credentials are properly provided
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  supabaseUrl !== '' &&
  supabaseKey !== '' &&
  !supabaseUrl.includes('your-supabase-url') &&
  !supabaseUrl.includes('placeholder')
);

if (!isSupabaseConfigured) {
  console.warn(
    '[AI-RailLink] Supabase credentials not detected in Vite environment. If you just added them to frontend/.env, please RESTART your Vite development server (press Ctrl+C, then run npm run dev).'
  );
} else {
  console.info('[AI-RailLink] Supabase client initialized successfully.');
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
