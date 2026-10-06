import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl.includes('placeholder-project') &&
    supabaseUrl.startsWith('https://')
  );
};

// Create a safe client. If placeholder, we create client with fallback strings to avoid crashing.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-careconnect.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);
