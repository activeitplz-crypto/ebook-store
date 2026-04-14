
import { createServerClient, type CookieOptions } from '@supabase/ssr';
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
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handle cases where cookies are set from Server Components
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Handle cases where cookies are set from Server Components
          }
        },
      },
    }
  );
}
