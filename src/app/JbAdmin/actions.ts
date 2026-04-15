'use server';

import { cookies } from 'next/headers';

/**
 * Handles the password-based login for the custom sales dashboard.
 */
export async function adminLogin(password: string) {
  if (password === 'Jnzb@!M40') {
    const cookieStore = await cookies();
    cookieStore.set('jb_admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });
    return { success: true };
  }
  return { error: 'Invalid password. Please try again.' };
}

/**
 * Logs out the admin by clearing the session cookie.
 */
export async function adminLogout() {
  const cookieStore = await cookies();
  cookieStore.delete('jb_admin_session');
}
