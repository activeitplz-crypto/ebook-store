
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
import type { Assignment } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { approveAssignment, rejectAssignment } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Check, ExternalLink, Loader2, X } from 'lucide-react';
import Link from 'next/link';

type EnrichedAssignment = Assignment & {
  profiles: { name: string | null; email: string | null } | null;
};

export function AssignmentsTable() {
  const [assignments, setAssignments] = useState<EnrichedAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('assignments')
      .select('*, profiles(name, email)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching assignments:', error);
      setAssignments([]);
    } else {
      setAssignments(data as EnrichedAssignment[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchAssignments();

    const channel = supabase
      .channel('realtime-assignments-admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'assignments' },
        () => fetchAssignments()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchAssignments]);

  if (loading) {
    return (
       <Card>
        <CardHeader>
          <CardTitle>Assignment Submissions</CardTitle>
          <CardDescription>Review and approve user task submissions.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Links</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[90px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[80px] rounded-full" /></TableCell>
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
        <CardTitle>Assignment Submissions</CardTitle>
        <CardDescription>Review and approve user task submissions. Pending requests require action.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Links</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {assignments.length > 0 ? (
                assignments.map((a) => (
                    <AssignmentRow key={a.id} assignment={a} />
                ))
            ) : (
                <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                    No pending assignment submissions found.
                </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function AssignmentRow({ assignment }: { assignment: EnrichedAssignment }) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleAction = async (action: (fd: FormData) => Promise<{error: string | null} | void>) => {
        const formData = new FormData();
        formData.append('assignmentId', assignment.id);

        startTransition(async () => {
            const result = await action(formData);
            if (result?.error) {
                toast({ variant: 'destructive', title: 'Action Failed', description: result.error });
            } else {
                 toast({ title: 'Success', description: 'Assignment status updated.' });
            }
        });
    }

    return (
        <TableRow>
            <TableCell>
                <div>{assignment.profiles?.name || 'N/A'}</div>
                <div className="text-xs text-muted-foreground">{assignment.profiles?.email}</div>
            </TableCell>
            <TableCell>{assignment.title}</TableCell>
            <TableCell>
                <div className='flex flex-col gap-1'>
                    {assignment.urls.map((url, index) => (
                        <Button key={index} variant="outline" size="sm" asChild>
                            <Link href={url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-3 w-3" />
                                Link {index + 1}
                            </Link>
                        </Button>
                    ))}
                </div>
            </TableCell>
            <TableCell>{format(new Date(assignment.created_at), 'PPP')}</TableCell>
            <TableCell>
                 <Badge variant={assignment.status === 'pending' ? 'secondary' : assignment.status === 'approved' ? 'default' : 'destructive'}>
                    {assignment.status}
                </Badge>
            </TableCell>
            <TableCell className="space-x-2">
                {assignment.status === 'pending' && (
                    <>
                        <Button size="sm" onClick={() => handleAction(approveAssignment)} disabled={isPending}>
                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />} Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleAction(rejectAssignment)} disabled={isPending}>
                           {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="mr-2 h-4 w-4" />} Reject
                        </Button>
                    </>
                )}
            </TableCell>
        </TableRow>
    )
}
