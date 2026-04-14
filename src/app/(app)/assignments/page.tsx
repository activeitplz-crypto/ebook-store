
import { createClient } from '@/lib/supabase/server';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AssignmentForm } from './assignment-form';
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
import type { Assignment, Plan } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileCheck2, History, Info } from 'lucide-react';

export default async function AssignmentsPage() {
  const supabase = createClient();
  const { data: { session }} = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }
  
  // Fetch user profile and their active plan details in one go
  const { data: user, error: userError } = await supabase
    .from('profiles')
    .select('id, name, current_plan')
    .eq('id', session.user.id)
    .single();

  if (userError || !user) {
    console.error('Assignments page error:', userError);
    return <div>Could not load user data.</div>;
  }
  
  let plan: Plan | null = null;
  if (user.current_plan) {
    const { data: planData } = await supabase
      .from('plans')
      .select('*')
      .eq('name', user.current_plan)
      .single();
    plan = planData;
  }
  
  const dailyAssignmentLimit = plan?.daily_assignments || 0;
  
  // Get assignments submitted today
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today
  const { count: assignmentsTodayCount, error: countError } = await supabase
    .from('assignments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', session.user.id)
    .gte('created_at', today.toISOString());
  
  if (countError) {
      console.error('Error counting assignments:', countError);
  }

  const remainingSubmissions = dailyAssignmentLimit - (assignmentsTodayCount || 0);

  const { data: assignments, error: assignmentsError } = await supabase
    .from('assignments')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

   if (assignmentsError) {
    console.error('Error fetching assignments:', assignmentsError);
    // Non-critical, so we can still render the rest of the page
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <FileCheck2 className="h-6 w-6 text-primary" />
            Submit Your Assignment
          </CardTitle>
          <CardDescription>
            You can submit up to {dailyAssignmentLimit} assignment(s) per day. You have {remainingSubmissions > 0 ? remainingSubmissions : 0} submission(s) left today.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dailyAssignmentLimit > 0 ? (
            <AssignmentForm user={user} dailyLimit={dailyAssignmentLimit} remainingSubmissions={remainingSubmissions} />
          ) : (
             <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>No Active Plan</AlertTitle>
                <AlertDescription>
                  You do not have an active plan. Please purchase a plan to start submitting assignments.
                </AlertDescription>
              </Alert>
          )}
        </CardContent>
      </Card>
      
      <AssignmentHistory assignments={assignments || []} />
    </div>
  );
}

function AssignmentHistory({ assignments }: { assignments: Assignment[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <History className="h-6 w-6 text-primary"/>
            Assignment History
        </CardTitle>
        <CardDescription>The status of your recent assignment submissions.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.length > 0 ? (
              assignments.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.title}</TableCell>
                  <TableCell>{format(new Date(a.created_at), 'PPP')}</TableCell>
                  <TableCell>
                    <Badge variant={a.status === 'pending' ? 'secondary' : a.status === 'approved' ? 'default' : 'destructive'}>
                      {a.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  You have not submitted any assignments yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
