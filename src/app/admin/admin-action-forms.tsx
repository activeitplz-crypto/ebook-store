
'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { approveWithdrawal, rejectWithdrawal } from './actions';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


interface AdminActionFormsProps {
  withdrawalId?: string;
}

export function AdminActionForms({ withdrawalId }: AdminActionFormsProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();


  const handleAction = (action: (formData: FormData) => Promise<{error: string | null} | void>) => {
    const formData = new FormData();
    if (withdrawalId) formData.append('withdrawalId', withdrawalId);
    
    startTransition(async () => {
      const result = await action(formData);
       if (result?.error) {
        toast({
          variant: 'destructive',
          title: 'Action Failed',
          description: result.error,
        });
      } else {
        toast({
          title: 'Success',
          description: `Withdrawal request has been updated.`,
        });
      }
    });
  };


  if (withdrawalId) {
    return (
      <div className="flex gap-2">
        <Button size="sm" onClick={() => handleAction(approveWithdrawal)} disabled={isPending}>
           {isPending && <Loader2 className="animate-spin" />} Approve
        </Button>
        <Button size="sm" variant="destructive" onClick={() => handleAction(rejectWithdrawal)} disabled={isPending}>
           {isPending && <Loader2 className="animate-spin" />} Reject
        </Button>
      </div>
    );
  }

  return null;
}
