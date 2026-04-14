'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { PostgrestError } from '@supabase/supabase-js';

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    throw new Error('Not authorized');
  }
  return supabase;
}

async function handleSupabaseResponse<T>(query: Promise<{ data: T | null; error: PostgrestError | null }>): Promise<T> {
  const { data, error } = await query;
  if (error) {
    console.error("Supabase Error:", error.message);
    throw new Error(error.message);
  }
  if (!data) {
    throw new Error("No data returned from the query.");
  }
  return data;
}

export async function approvePayment(formData: FormData) {
  const paymentId = formData.get('paymentId') as string;
  if (!paymentId) return { error: 'Payment ID is missing.' };

  const supabase = await verifyAdmin();
  
  try {
    const payment = await handleSupabaseResponse(
      supabase
        .from('payments')
        .select('user_id, plan_id')
        .eq('id', paymentId)
        .eq('status', 'pending')
        .single()
    );

    const plan = await handleSupabaseResponse(
      supabase
        .from('plans')
        .select('name')
        .eq('id', payment.plan_id)
        .single()
    );

    const profile = await handleSupabaseResponse(
      supabase
        .from('profiles')
        .select('id, referred_by')
        .eq('id', payment.user_id)
        .single()
    );
      
    const { error: transactionError } = await supabase.rpc('approve_payment_and_distribute_bonus', {
        p_payment_id: paymentId,
        p_user_id: profile.id,
        p_plan_name: plan.name,
        p_referred_by_id: profile.referred_by
    });

    if (transactionError) {
        throw new Error(`Transaction failed: ${transactionError.message}`);
    }

  } catch (error: any) {
    console.error('Approve Payment Logic Error:', error.message);
    return { error: error.message };
  }
  
  revalidatePath('/admin');
  return { error: null };
}

export async function rejectPayment(formData: FormData) {
  const supabase = await verifyAdmin();
  const paymentId = formData.get('paymentId') as string;

  const { error } = await supabase
    .from('payments')
    .update({ status: 'rejected' })
    .eq('id', paymentId);
    
  if (error) {
    console.error('Reject Payment Error:', error);
    return { error: 'Failed to reject payment.' };
  }

  revalidatePath('/admin');
}

export async function approveWithdrawal(formData: FormData) {
  const supabase = await verifyAdmin();
  const withdrawalId = formData.get('withdrawalId') as string;
  
  try {
     await supabase.rpc('approve_withdrawal', { p_withdrawal_id: withdrawalId });
  } catch (error: any) {
     console.error('Approve Withdrawal Error:', error);
     return { error: error.message };
  }
  
  revalidatePath('/admin');
  revalidatePath('/dashboard');
}

export async function rejectWithdrawal(formData: FormData) {
  const supabase = await verifyAdmin();
  const withdrawalId = formData.get('withdrawalId') as string;

  const { error } = await supabase
    .from('withdrawals')
    .update({ status: 'rejected' })
    .eq('id', withdrawalId);

  if (error) {
    console.error('Reject Withdrawal Error:', error);
    return { error: 'Failed to reject withdrawal.' };
  }

  revalidatePath('/admin');
}

const planSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Plan name is required'),
    investment: z.coerce.number().positive('Investment must be a positive number'),
    daily_earning: z.coerce.number().positive('Daily earning must be a positive number'),
    daily_assignments: z.coerce.number().int().positive('Daily assignments must be a positive integer'),
});

export async function savePlan(formData: z.infer<typeof planSchema>) {
    const supabase = await verifyAdmin();
    const validatedData = planSchema.parse(formData);
    const { id, ...planData } = validatedData;

    try {
        if (id) {
            const { error } = await supabase.from('plans').update(planData).eq('id', id);
            if (error) throw error;
        } else {
            const { error } = await supabase.from('plans').insert(planData);
            if (error) throw error;
        }
    } catch (error: any) {
        console.error('Save Plan Error:', error);
        return { error: `Failed to save plan. Database error: ${error.message}` };
    }

    revalidatePath('/admin');
    revalidatePath('/plans');
    return { error: null };
}

const taskSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1, 'Task title is required'),
    url: z.string().url('Must be a valid URL'),
});

export async function saveTask(formData: z.infer<typeof taskSchema>) {
    const supabase = await verifyAdmin();
    const validatedData = taskSchema.parse(formData);
    const { id, ...taskData } = validatedData;

    try {
        if (id) {
            await supabase.from('tasks').update(taskData).eq('id', id);
        } else {
            await supabase.from('tasks').insert(taskData);
        }
    } catch (error: any) {
        console.error('Save Task Error:', error);
        return { error: `Failed to save task. Database error: ${error.message}` };
    }

    revalidatePath('/admin');
    revalidatePath('/tasks');
    return { error: null };
}

export async function deleteTask(formData: FormData) {
    const supabase = await verifyAdmin();
    const id = formData.get('id') as string;
    if (!id) return { error: 'Task ID is missing' };

    try {
        await supabase.from('tasks').delete().eq('id', id);
    } catch (error: any) {
        console.error('Delete Task Error:', error);
        return { error: `Failed to delete task. Database error: ${error.message}` };
    }

    revalidatePath('/admin');
    revalidatePath('/tasks');
    return { error: null };
}

export async function approveAssignment(formData: FormData) {
  const supabase = await verifyAdmin();
  const assignmentId = formData.get('assignmentId') as string;

  const { error } = await supabase
    .from('assignments')
    .update({ status: 'approved' })
    .eq('id', assignmentId);

  if (error) {
    console.error('Approve Assignment Error:', error);
    return { error: 'Failed to approve assignment.' };
  }

  revalidatePath('/admin');
  revalidatePath('/assignments');
}

export async function rejectAssignment(formData: FormData) {
  const supabase = await verifyAdmin();
  const assignmentId = formData.get('assignmentId') as string;

  const { error } = await supabase
    .from('assignments')
    .update({ status: 'rejected' })
    .eq('id', assignmentId);

  if (error) {
    console.error('Reject Assignment Error:', error);
    return { error: 'Failed to reject assignment.' };
  }

  revalidatePath('/admin');
  revalidatePath('/assignments');
}

const reviewSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Reviewer name is required'),
    content: z.string().min(1, 'Review content is required'),
});

export async function saveReview(formData: z.infer<typeof reviewSchema>) {
    const supabase = await verifyAdmin();
    const validatedData = reviewSchema.parse(formData);
    const { id, ...reviewData } = validatedData;

    try {
        if (id) {
            await supabase.from('reviews').update(reviewData).eq('id', id);
        } else {
            await supabase.from('reviews').insert(reviewData);
        }
    } catch (error: any) {
        console.error('Save Review Error:', error);
        return { error: `Failed to save review. Database error: ${error.message}` };
    }

    revalidatePath('/admin');
    revalidatePath('/reviews');
    return { error: null };
}

export async function deleteReview(formData: FormData) {
    const supabase = await verifyAdmin();
    const id = formData.get('id') as string;
    if (!id) return { error: 'Review ID is missing' };

    try {
        await supabase.from('reviews').delete().eq('id', id);
    } catch (error: any) {
        console.error('Delete Review Error:', error);
        return { error: `Failed to delete review. Database error: ${error.message}` };
    }

    revalidatePath('/admin');
    revalidatePath('/reviews');
    return { error: null };
}

const videoSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1, 'Video title is required'),
    url: z.string().url('Must be a valid URL'),
});

export async function saveVideo(formData: z.infer<typeof videoSchema>) {
    const supabase = await verifyAdmin();
    const validatedData = videoSchema.parse(formData);
    const { id, ...videoData } = validatedData;

    try {
        if (id) {
            await supabase.from('videos').update(videoData).eq('id', id);
        } else {
            await supabase.from('videos').insert(videoData);
        }
    } catch (error: any) {
        console.error('Save Video Error:', error);
        return { error: `Failed to save video. Database error: ${error.message}` };
    }

    revalidatePath('/admin');
    revalidatePath('/watch');
    return { error: null };
}

export async function deleteVideo(formData: FormData) {
    const supabase = await verifyAdmin();
    const id = formData.get('id') as string;
    if (!id) return { error: 'Video ID is missing' };

    try {
        await supabase.from('videos').delete().eq('id', id);
    } catch (error: any) {
        console.error('Delete Video Error:', error);
        return { error: `Failed to delete video. Database error: ${error.message}` };
    }

    revalidatePath('/admin');
    revalidatePath('/watch');
    return { error: null };
}