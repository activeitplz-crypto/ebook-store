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
 * Updates the status of an order and ensures it persists in Supabase.
 */
export async function updateOrderStatus(orderId: string, status: 'pending' | 'confirmed' | 'rejected') {
  const cookieStore = await cookies();
  const session = cookieStore.get('jb_admin_session');
  const isAuth = session?.value === 'authenticated';
  
  if (!isAuth) {
    return { error: 'Unauthorized access.' };
  }

  const supabase = await createClient();
  
  // Update the status in the database
  // We use lowercase to match the Postgres ENUM type exactly
  const { data, error, count } = await supabase
    .from('orders')
    .update({ status: status.toLowerCase() })
    .eq('id', orderId)
    .select();

  if (error) {
    console.error('Supabase Update Error:', error);
    return { error: error.message };
  }

  // If data is returned, the update was successful
  if (!data || data.length === 0) {
    return { error: 'Update failed: Order not found or RLS policy blocked the change. Please ensure RLS is disabled on the orders table.' };
  }

  // Force revalidation of all paths that show order data
  revalidatePath('/JbAdmin');
  revalidatePath('/');
  
  return { success: true };
}
