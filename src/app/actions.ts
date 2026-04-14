'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitOrder(formData: {
  product_title: string;
  price: number;
  sender_name: string;
  sender_number: string;
  delivery_contact: string;
  screenshot_url: string;
  payment_method: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase.from('orders').insert([
    {
      product_title: formData.product_title,
      price: formData.price,
      sender_name: formData.sender_name,
      sender_number: formData.sender_number,
      delivery_contact: formData.delivery_contact,
      screenshot_url: formData.screenshot_url,
      payment_method: formData.payment_method,
      status: 'pending',
    },
  ]);

  if (error) {
    console.error('Order Submission Error:', error);
    return { 
      error: error.message || 'Failed to submit order. Please ensure the database table is configured correctly.' 
    };
  }

  revalidatePath('/');
  return { success: true };
}

export async function submitReview(data: {
  productId: string;
  name: string;
  rating: number;
  content: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase.from('reviews').insert([
    {
      product_id: data.productId,
      name: data.name,
      rating: data.rating,
      content: data.content,
    },
  ]);

  if (error) {
    console.error('Review Submission Error:', error);
    return { success: false, error: error.message || 'Failed to submit review.' };
  }

  revalidatePath(`/products/${data.productId}`);
  return { success: true };
}
