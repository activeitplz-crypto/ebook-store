
import { createClient } from '@/lib/supabase/server';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { WithdrawForm } from './withdraw-form';
import { redirect } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import type { Withdrawal } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default async function WithdrawPage() {
  const supabase = createClient();
  const { data: { session }} = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const { data: user, error: userError } = await supabase
    .from('profiles')
    .select('current_balance')
    .eq('id', session.user.id)
    .single();
  
  const { data: withdrawals, error: withdrawalsError } = await supabase
    .from('withdrawals')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (userError || !user) {
    return <div>Loading...</div>;
  }
   if (withdrawalsError) {
    console.error('Error fetching withdrawals:', withdrawalsError);
    // Non-critical, so we can still render the rest of the page
  }

  const availableBalance = user.current_balance;

  return (
    <div className="space-y-6">
       <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Withdrawal Information</AlertTitle>
        <AlertDescription>
          The minimum withdrawal amount is PKR 700.
        </AlertDescription>
      </Alert>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Request Withdrawal</CardTitle>
          <CardDescription>
            Your current available balance is PKR {availableBalance.toFixed(2)}. Withdrawals are manually processed within 24 hours.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WithdrawForm currentBalance={availableBalance} canWithdraw={true} />
        </CardContent>
      </Card>
      
      <WithdrawalHistory withdrawals={withdrawals || []} />
    </div>
  );
}

function WithdrawalHistory({ withdrawals }: { withdrawals: Withdrawal[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Withdrawal History</CardTitle>
        <CardDescription>The status of your recent withdrawal requests.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Amount</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {withdrawals.length > 0 ? (
              withdrawals.map((w) => (
                <TableRow key={w.id}>
                  <TableCell>PKR {w.amount.toFixed(2)}</TableCell>
                  <TableCell>{w.account_info.bank_name} ({w.account_info.account_number})</TableCell>
                  <TableCell>{format(new Date(w.created_at), 'PPP')}</TableCell>
                  <TableCell>
                    <Badge variant={w.status === 'pending' ? 'secondary' : w.status === 'approved' ? 'default' : 'destructive'}>
                      {w.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  You have not made any withdrawal requests yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
