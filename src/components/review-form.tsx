
'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Star, Loader2, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { submitReview } from '@/app/actions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function ReviewForm({ productId }: { productId: string }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const content = formData.get('content') as string;

    if (!name || !content) {
      toast({ variant: "destructive", title: "Error", description: "Please fill in all fields." });
      return;
    }

    startTransition(async () => {
      const result = await submitReview({ productId, name, rating, content });
      if (result.success) {
        toast({ title: "Review Submitted", description: "Thank you for your feedback!" });
        setOpen(false);
        // The page will revalidate on the server thanks to revalidatePath in the action
      } else {
        toast({ 
          variant: "destructive", 
          title: "Submission Error", 
          description: result.error 
        });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex gap-2 mb-12">
          <Button className="bg-primary hover:bg-primary/90 rounded-sm px-8">Write a review</Button>
          <Button variant="outline" size="icon"><MessageSquare className="h-4 w-4" /></Button>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-primary">Write a Review</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-8 w-8 cursor-pointer transition-colors ${
                    s <= rating ? 'fill-amber-500 text-amber-500' : 'text-slate-200'
                  }`}
                  onClick={() => setRating(s)}
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Name</label>
            <Input name="name" required placeholder="John Doe" className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Comment</label>
            <Textarea 
              name="content" 
              required 
              placeholder="Tell us what you loved about this product..." 
              className="rounded-xl min-h-[100px]"
            />
          </div>
          <Button type="submit" className="w-full rounded-full h-12" disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Submit Feedback'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
