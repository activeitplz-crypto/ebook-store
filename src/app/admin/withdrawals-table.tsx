
'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { format } from 'date-fns';
import { AdminActionForms } from './admin-action-forms';
import { Skeleton } from '@/components/ui/skeleton';
import type { Withdrawal } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type EnrichedWithdrawal = Withdrawal & {
  profiles: { name: string | null; email: string | null } | null;
};


export function WithdrawalsTable() {
  const [withdrawals, setWithdrawals] = useState<EnrichedWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchWithdrawals = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('withdrawals')
      .select('*, profiles(name, email)')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching withdrawals:', error);
      setWithdrawals([]);
    } else {
      setWithdrawals(data as EnrichedWithdrawal[]);
    }
    setLoading(false);
  }, [supabase]);


  useEffect(() => {
    fetchWithdrawals();

    const channel = supabase
      .channel('realtime-withdrawals-admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'withdrawals' },
        (payload) => {
           fetchWithdrawals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchWithdrawals]);

  if (loading) {
     return (
       <Card>
        <CardHeader>
          <CardTitle>Withdrawal Requests</CardTitle>
          <CardDescription>Review and process user withdrawal requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Bank/Service</TableHead>
                <TableHead>Account Name</TableHead>
                <TableHead>Account Number</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[90px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[80px] rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-[170px]" /></TableCell>
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
        <CardTitle>Withdrawal Requests</CardTitle>
        <CardDescription>Review and process user withdrawal requests. Pending requests require action.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Bank/Service</TableHead>
              <TableHead>Account Name</TableHead>
              <TableHead>Account Number</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {withdrawals.length > 0 ? (
              withdrawals.map((w) => (
                <TableRow key={w.id}>
                  <TableCell>
                      <div>{w.profiles?.name || 'N/A'}</div>
                      <div className="text-xs text-muted-foreground">{w.profiles?.email}</div>
                  </TableCell>
                  <TableCell>PKR {w.amount.toFixed(2)}</TableCell>
                  <TableCell>{w.account_info.bank_name}</TableCell>
                  <TableCell>{w.account_info.holder_name}</TableCell>
                  <TableCell>{w.account_info.account_number}</TableCell>
                  <TableCell>{format(new Date(w.created_at), 'PPP')}</TableCell>
                  <TableCell><Badge variant={w.status === 'pending' ? 'secondary' : w.status === 'approved' ? 'default' : 'destructive'}>{w.status}</Badge></TableCell>
                  <TableCell className="space-x-2">
                    {w.status === 'pending' && <AdminActionForms withdrawalId={w.id} />}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No withdrawal requests found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
