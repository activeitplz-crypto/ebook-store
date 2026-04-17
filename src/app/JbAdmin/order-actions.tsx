'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, Loader2 } from 'lucide-react';
import { updateOrderStatus } from './actions';
import { useToast } from '@/hooks/use-toast';

interface OrderActionsProps {
  orderId: string;
}

export function OrderActions({ orderId }: OrderActionsProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleStatusUpdate = (status: 'confirmed' | 'rejected') => {
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, status);
      if (result.success) {
        toast({
          title: `Order ${status === 'confirmed' ? 'Approved' : 'Rejected'}`,
          description: `The order status has been updated to ${status}.`,
        });
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
      <Button
        size="sm"
        variant="outline"
        className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:text-green-700 border-green-200"
        onClick={() => handleStatusUpdate('confirmed')}
        disabled={isPending}
        title="Approve Order"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
        onClick={() => handleStatusUpdate('rejected')}
        disabled={isPending}
        title="Reject Order"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
      </Button>
    </div>
  );
}
