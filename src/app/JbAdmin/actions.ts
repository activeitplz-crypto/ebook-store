'use server';

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

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

/**
 * Updates the status of an order.
 */
export async function updateOrderStatus(orderId: string, status: 'pending' | 'confirmed' | 'rejected') {
  const cookieStore = await cookies();
  const isAuth = cookieStore.get('jb_admin_session')?.value === 'authenticated';
  
  if (!isAuth) {
    return { error: 'Unauthorized access.' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) {
    console.error('Update Order Status Error:', error);
    return { error: error.message };
  }

  revalidatePath('/JbAdmin');
  return { success: true };
}
