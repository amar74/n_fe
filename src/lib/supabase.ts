import { createClient } from '@supabase/supabase-js';

// Use proper placeholder values that pass Supabase validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xxxxxxxxxxxxxxxxxxxxx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDYwNjc2MDAsImV4cCI6MTk2MTY0MzYwMH0.placeholder';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    '⚠️  Missing Supabase environment variables. Using placeholder values. Authentication will not work.\n' +
    'Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file for full functionality.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
