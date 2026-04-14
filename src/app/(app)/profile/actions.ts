
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  avatar_url: z.string().url({ message: 'Please enter a valid URL.' }).nullable().or(z.literal('')),
});

export async function updateProfile(formData: z.infer<typeof updateProfileSchema>) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to update your profile.' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ 
      name: formData.name,
      avatar_url: formData.avatar_url,
    })
    .eq('id', user.id);

  if (error) {
    console.error('Update Profile Error:', error);
    return { error: 'Could not update profile.' };
  }

  revalidatePath('/profile');
  revalidatePath('/(app)', 'layout');
  return { error: null };
}
