'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '../database.types';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Provide a fallback to a dummy valid URL to prevent "Invalid supabaseUrl" crash during dev
  const validUrl = supabaseUrl && supabaseUrl.startsWith('http') 
    ? supabaseUrl 
    : 'https://placeholder.supabase.co';

  const validKey = supabaseAnonKey || 'placeholder-key';

  return createBrowserClient<Database>(validUrl, validKey);
}
