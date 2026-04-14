
'use client';

import { useForm } from 'react-hook-form';
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
import { useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { submitAssignment } from './actions';
import { useRouter } from 'next/navigation';
import type { Profile } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Dynamically create the schema based on the daily limit
const createFormSchema = (dailyLimit: number) => {
  let schema = z.object({
    title: z.string().min(3, { message: 'Title must be at least 3 characters long.' }),
    url1: z.string().url({ message: 'Please provide a valid URL.' }),
  });

  // Add optional URL fields up to the daily limit
  for (let i = 2; i <= dailyLimit; i++) {
    schema = schema.extend({
      [`url${i}`]: z.string().url().optional().or(z.literal('')),
    });
  }

  return schema;
};

interface AssignmentFormProps {
  user: Pick<Profile, 'id' | 'name'>;
  dailyLimit: number;
  remainingSubmissions: number;
}

export function AssignmentForm({ user, dailyLimit, remainingSubmissions }: AssignmentFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const formSchema = createFormSchema(dailyLimit);

  const defaultValues: { [key: string]: string } = { title: '', };
  for (let i = 1; i <= dailyLimit; i++) {
    defaultValues[`url${i}`] = '';
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const result = await submitAssignment(values as any); // We cast to any because the server action now handles dynamic urls
      if (result?.error) {
        toast({
          variant: 'destructive',
          title: 'Submission Failed',
          description: result.error,
        });
      } else {
        toast({
          title: 'Success',
          description: 'Your assignment has been submitted for review.',
        });
        form.reset();
        router.refresh();
      }
    });
  }
  
  if (remainingSubmissions <= 0) {
      return (
          <Alert variant="destructive">
              <AlertTitle>Daily Limit Reached</AlertTitle>
              <AlertDescription>
                  You have already submitted all your assignments for today. Please come back tomorrow.
              </AlertDescription>
          </Alert>
      )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
         <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
             <div className="rounded-lg border bg-muted p-3">
                <FormLabel>Your Name</FormLabel>
                <p className="font-semibold text-foreground">{user.name || 'N/A'}</p>
            </div>
            <div className="rounded-lg border bg-muted p-3">
                <FormLabel>Your User ID</FormLabel>
                <p className="font-semibold text-foreground">{user.id}</p>
            </div>
         </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assignment Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Week 1 Social Media Tasks" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-3">
            {[...Array(dailyLimit)].map((_, i) => {
                const urlFieldName = `url${i + 1}` as const;
                return (
                     <FormField
                        key={urlFieldName}
                        control={form.control}
                        name={urlFieldName}
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Task URL {i + 1} {i === 0 ? '(Required)' : '(Optional)'}</FormLabel>
                            <FormControl>
                                <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                )
            })}
        </div>
        
        <Button type="submit" className="w-full" disabled={isPending || remainingSubmissions <= 0}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Assignment
        </Button>
      </form>
    </Form>
  );
}
