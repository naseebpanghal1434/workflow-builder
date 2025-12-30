/**
 * @fileoverview Supabase client initialization
 * @module Lib/Supabase
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase URL from environment variables
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

/**
 * Supabase anonymous key from environment variables
 */
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Whether Supabase is configured
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * Log warning if Supabase is not configured
 */
if (!isSupabaseConfigured) {
  console.warn(
    'Supabase environment variables are not set. Database features will be disabled.'
  );
}

/**
 * Supabase client instance
 *
 * @description
 * Configured for client-side use with anonymous access.
 * For server-side operations with elevated privileges,
 * create a separate client with the service role key.
 *
 * @example
 * import { supabase } from '@/lib/supabase';
 * const { data, error } = await supabase.from('workflows').select('*');
 */
export const supabase: SupabaseClient = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: false, // No auth in this project
    },
  }
);
