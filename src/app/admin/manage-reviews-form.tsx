
'use client';

import { useTransition } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { saveReview, deleteReview } from './actions';
import type { Review } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

const reviewSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Reviewer name is required'),
  content: z.string().min(1, 'Review content is required'),
});

const formSchema = z.object({
  reviews: z.array(reviewSchema),
});

interface ManageReviewsFormProps {
  reviews: Review[];
}

export function ManageReviewsForm({ reviews: initialReviews }: ManageReviewsFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reviews: initialReviews || [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'reviews',
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      for (const review of values.reviews) {
        const result = await saveReview(review);
        if (result?.error) {
          toast({
            variant: 'destructive',
            title: `Failed to save review for "${review.name}"`,
            description: result.error,
          });
          return;
        }
      }
      toast({
        title: 'Success',
        description: 'All review changes have been saved.',
      });
    });
  }
  
  const handleRemove = (index: number) => {
    const item = fields[index];
    if (item.id) {
        startTransition(async () => {
            const formData = new FormData();
            formData.append('id', item.id as string);
            const result = await deleteReview(formData);
             if (result?.error) {
                toast({ variant: 'destructive', title: 'Deletion Failed', description: result.error });
            } else {
                remove(index);
                toast({ title: 'Review Deleted' });
            }
        });
    } else {
        remove(index);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage User Reviews</CardTitle>
        <CardDescription>
          Add, edit, or delete user testimonials that appear on the reviews page.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id} className="relative p-4">
                  <div className="grid grid-cols-1 gap-4">
                    <input
                      type="hidden"
                      {...form.register(`reviews.${index}.id`)}
                    />
                    <FormField
                      control={form.control}
                      name={`reviews.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reviewer Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., John D." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`reviews.${index}.content`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Review Content</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Write the review content here..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-destructive"
                    onClick={() => handleRemove(index)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </Card>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  append({ name: '', content: '' }, { shouldFocus: true })
                }
                disabled={isPending}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Review
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save All Reviews
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
