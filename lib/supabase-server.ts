/**
 * @fileoverview Server-side Supabase client for API routes
 * @module Lib/SupabaseServer
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase URL from environment variables
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

/**
 * Supabase service role key for server-side operations
 * Falls back to anon key if service role not available
 */
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Whether Supabase is configured for server-side use
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

/**
 * Create a server-side Supabase client
 *
 * @returns {SupabaseClient} Supabase client configured for server use
 */
export function createServerSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables are not configured');
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
