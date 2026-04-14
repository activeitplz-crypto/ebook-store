
'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import type { Payment } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { approvePayment, rejectPayment } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

type EnrichedPayment = Payment & {
  profiles: { name: string | null; email: string | null } | null;
  plans: { name: string | null } | null;
};

export function PaymentsTable() {
  const [payments, setPayments] = useState<EnrichedPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('payments')
      .select('*, profiles(name, email), plans(name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    } else {
      setPayments(data as EnrichedPayment[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchPayments();

    const channel = supabase
      .channel('realtime-payments-admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        (payload) => {
          // Instead of full refetch, intelligently update the state
          const oldRecord = (payload.old as EnrichedPayment);
          const newRecord = (payload.new as EnrichedPayment);

          if (payload.eventType === 'UPDATE' && oldRecord.status === 'pending' && newRecord.status !== 'pending') {
             setPayments(currentPayments => currentPayments.filter(p => p.id !== oldRecord.id));
          } else if (payload.eventType === 'INSERT' && newRecord.status === 'pending') {
             fetchPayments(); // refetch on new inserts
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchPayments]);

  if (loading) {
    return (
       <Card>
        <CardHeader>
          <CardTitle>Pending Plan Payments</CardTitle>
          <CardDescription>Review and approve new plan purchase requests.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Payment UID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {[...Array(3)].map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[90px]" /></TableCell>
                    <TableCell className="space-x-2"><Skeleton className="h-8 w-[80px]" /><Skeleton className="h-8 w-[80px]" /></TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Plan Payments</CardTitle>
        <CardDescription>Review and approve new plan purchase requests. Approved or rejected requests will be removed from this list.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Payment UID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {payments.length > 0 ? (
                payments.map((p) => (
                    <PaymentRow key={p.id} payment={p} />
                ))
            ) : (
                <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                    No pending payment requests found.
                </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function PaymentRow({ payment }: { payment: EnrichedPayment }) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleAction = async (action: (fd: FormData) => Promise<{error: string | null} | void>) => {
        const formData = new FormData();
        formData.append('paymentId', payment.id);

        startTransition(async () => {
            const result = await action(formData);
            if (result?.error) {
                toast({ variant: 'destructive', title: 'Action Failed', description: result.error });
            } else {
                 toast({ title: 'Success', description: 'Action completed.' });
            }
        });
    }

    return (
        <TableRow>
            <TableCell>
                <div>{payment.profiles?.name || 'N/A'}</div>
                <div className="text-xs text-muted-foreground">{payment.profiles?.email}</div>
            </TableCell>
            <TableCell>{payment.plans?.name || 'N/A'}</TableCell>
            <TableCell>{payment.payment_uid}</TableCell>
            <TableCell>{format(new Date(payment.created_at), 'PPP')}</TableCell>
            <TableCell className="space-x-2">
                <Button size="sm" onClick={() => handleAction(approvePayment)} disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Approve
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleAction(rejectPayment)} disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Reject
                </Button>
            </TableCell>
        </TableRow>
    )
}
