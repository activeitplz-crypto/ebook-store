'use server';

import { cookies } from 'next/headers';

// Note: This helper is legacy. The app now uses Supabase for authentication.
export async function getSession() {
  const cookieStore = await cookies();
  const email = cookieStore.get('sb-auth-token')?.value;

  if (email) {
    return {
      isLoggedIn: true,
      email: email,
    };
  }
  
  return null;
}
