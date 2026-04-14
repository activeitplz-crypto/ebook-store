'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function login(formData: z.infer<typeof loginSchema>) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword(formData);

  if (error) {
    console.error('Login Error:', error.message);
    return { error: 'Invalid email or password.' };
  }
  
  if (data.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    revalidatePath('/admin', 'layout');
    redirect('/admin');
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function signup(formData: z.infer<typeof signupSchema>) {
  const supabase = await createClient();
  const referral_code = `${formData.name.toUpperCase().slice(0,4)}-REF-${Date.now().toString().slice(-4)}`;

  const { error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
      data: {
        name: formData.name,
        referral_code: referral_code,
      },
    },
  });

  if (error) {
    console.error('Signup Error:', error.message);
    return { error: 'Could not create user. Please try again.', success: false };
  }

  return { error: null, success: true };
}


export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
