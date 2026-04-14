
import { createClient } from '@/lib/supabase/server';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users, DollarSign, UserCheck, UserX } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ReferralLinkCard } from '@/components/referral-link-card';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';
import type { Profile } from '@/lib/types';

export default async function ReferralsPage() {
  const supabase = createClient();
  const { data: { session }} = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const { data: user, error: userError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (userError || !user) {
    console.error('Referrals Error:', userError);
    return <div>Could not load user data.</div>;
  }
  
  // Fetch all users who were referred by the current user
  const { data: referredProfiles, error: referredError } = await supabase
    .from('profiles')
    .select('name, email, current_plan, created_at')
    .eq('referred_by', user.id);

  if (referredError) {
    console.error('Error fetching referred users:', referredError);
     // We can still render the page even if this fails, just show empty lists.
  }

  const verifiedReferrals = referredProfiles?.filter(p => p.current_plan) || [];
  const unverifiedReferrals = referredProfiles?.filter(p => !p.current_plan) || [];
  
  const referralLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/signup?ref=${user.referral_code}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Referrals</h1>
        <p className="text-muted-foreground">
          Invite friends and earn rewards when they invest.
        </p>
      </div>

      <ReferralLinkCard referralLink={referralLink} />
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Referrals</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verifiedReferrals.length}</div>
            <p className="text-xs text-muted-foreground">
              Total friends who joined and purchased a plan.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referral Bonus</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">PKR {user.referral_bonus.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total earnings from your referrals.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-green-500" />
            Verified Referrals
          </CardTitle>
           <CardDescription>Users you referred who have an active plan.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Plan Purchased</TableHead>
                <TableHead>Join Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {verifiedReferrals.length > 0 ? verifiedReferrals.map((ref: any, index: number) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{ref.name}</TableCell>
                  <TableCell>{ref.current_plan}</TableCell>
                  <TableCell>{format(new Date(ref.created_at), 'PPP')}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={3} className="text-center">No verified referrals yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
             <UserX className="h-5 w-5 text-red-500" />
            Unverified Referrals
          </CardTitle>
           <CardDescription>Users who signed up with your link but haven't purchased a plan.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Join Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unverifiedReferrals.length > 0 ? unverifiedReferrals.map((ref: any, index: number) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{ref.name}</TableCell>
                  <TableCell>{ref.email}</TableCell>
                  <TableCell>{format(new Date(ref.created_at), 'PPP')}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={3} className="text-center">No unverified referrals yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
