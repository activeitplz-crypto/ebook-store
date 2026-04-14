
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function purchasePlan(formData: FormData) {
  const planId = formData.get('plan_id') as string;
  const paymentUid = formData.get('payment_uid') as string;
  
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!planId || !paymentUid || !user) {
    return { error: 'Missing plan information, payment UID, or user session.' };
  }
  
  const { error } = await supabase
    .from('payments')
    .insert({
      plan_id: planId,
      payment_uid: paymentUid,
      user_id: user.id
    });
  
  if (error) {
    console.error('Payment Error:', error);
    return { error: 'Failed to record your payment request.' };
  }

  revalidatePath('/admin');
  redirect('/dashboard');
}
