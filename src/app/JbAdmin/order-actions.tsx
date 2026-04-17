'use client';

import { useTransition } from 'react';
import { updateOrderStatus } from './actions';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OrderActionsProps {
  orderId: string;
  currentStatus: string;
}

export function OrderActions({ orderId, currentStatus }: OrderActionsProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleStatusUpdate = (status: 'pending' | 'confirmed' | 'rejected') => {
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, status);
      if (result.success) {
        toast({
          title: 'Status Updated',
          description: `Order #${orderId.slice(0, 5)} is now ${status}.`,
        });
        // refresh ensures server components re-fetch the latest data
        router.refresh();
      } else {
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: result.error || 'Something went wrong.',
        });
      }
    });
  };

  return (
    <div className="flex items-center gap-2 justify-end">
      {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      <Select
        defaultValue={String(currentStatus || 'pending').toLowerCase()}
        onValueChange={(val) => handleStatusUpdate(val as any)}
        disabled={isPending}
      >
        <SelectTrigger className="h-8 w-[120px] text-[10px] font-bold uppercase tracking-wider bg-white">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending" className="text-[10px] font-bold text-slate-500 uppercase">Pending</SelectItem>
          <SelectItem value="confirmed" className="text-[10px] font-bold text-green-600 uppercase">Confirmed</SelectItem>
          <SelectItem value="rejected" className="text-[10px] font-bold text-red-600 uppercase">Rejected</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
