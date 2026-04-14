
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { requestWithdrawal } from './actions';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  amount: z.coerce
    .number({ invalid_type_error: 'Please enter a valid number.' })
    .min(700, { message: 'Minimum withdrawal amount is 700 RS.' }),
  bank_name: z.string().min(2, { message: 'Bank/Service name is required.' }),
  holder_name: z.string().min(2, { message: 'Account holder name is required.' }),
  account_number: z.string().min(11, { message: 'Account number is required.'}),
});

interface WithdrawFormProps {
    currentBalance: number;
    canWithdraw: boolean;
}

export function WithdrawForm({ currentBalance, canWithdraw }: WithdrawFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: '' as any,
      bank_name: '',
      holder_name: '',
      account_number: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
     if (values.amount > currentBalance) {
      form.setError("amount", {
        type: "manual",
        message: "Amount cannot exceed your current balance.",
      });
      return;
    }

    startTransition(async () => {
      const result = await requestWithdrawal(values);
      if (result?.error) {
        toast({
          variant: 'destructive',
          title: 'Withdrawal Failed',
          description: result.error,
        });
      } else {
        toast({
          title: 'Success',
          description: 'Your withdrawal request has been submitted.',
        });
        form.reset();
        router.refresh();
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (PKR)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="e.g., 700.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bank_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank / Service Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Easypaisa, JazzCash" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="holder_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Holder Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="account_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Number</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 03123456789" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending || !canWithdraw}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {canWithdraw ? 'Submit Request' : '5 Verified Referrals Required'}
        </Button>
      </form>
    </Form>
  );
}
