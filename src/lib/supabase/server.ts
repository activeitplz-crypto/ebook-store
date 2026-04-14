import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '../database.types';

export async function createClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const validUrl = supabaseUrl && supabaseUrl.startsWith('http') 
    ? supabaseUrl 
    : 'https://placeholder.supabase.co';

  const validKey = supabaseAnonKey || 'placeholder-key';

  return createServerClient<Database>(
    validUrl,
    validKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
