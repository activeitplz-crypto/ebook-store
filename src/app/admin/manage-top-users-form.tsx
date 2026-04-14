
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
import { saveTopUser, deleteTopUser } from './actions';
import type { TopUser } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const topUserSchema = z.object({
  id: z.string().optional(),
  image_url: z.string().url({ message: 'Please enter a valid URL.' }),
});

const formSchema = z.object({
  top_users: z.array(topUserSchema),
});

interface ManageTopUsersFormProps {
  topUsers: TopUser[];
}

export function ManageTopUsersForm({ topUsers: initialTopUsers }: ManageTopUsersFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      top_users: initialTopUsers || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'top_users',
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      // Find the new items to save (those without an ID)
      const newItems = values.top_users.filter(item => !item.id);

      for (const topUser of newItems) {
        const result = await saveTopUser(topUser);
        if (result?.error) {
          toast({
            variant: 'destructive',
            title: `Failed to save new screenshot`,
            description: result.error,
          });
          return;
        }
      }
      
      if(newItems.length > 0) {
        toast({
            title: 'Success',
            description: 'All new screenshots have been saved.',
        });
      } else {
         toast({
            title: 'No New Items',
            description: 'There were no new screenshots to save.',
        });
      }
    });
  }
  
  const handleRemove = (index: number) => {
    const item = fields[index];
    if (item.id) {
        startTransition(async () => {
            const formData = new FormData();
            formData.append('id', item.id as string);
            const result = await deleteTopUser(formData);
             if (result?.error) {
                toast({ variant: 'destructive', title: 'Deletion Failed', description: result.error });
            } else {
                remove(index);
                toast({ title: 'Screenshot Deleted' });
            }
        });
    } else {
        remove(index);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Top Users Screenshots</CardTitle>
        <CardDescription>
          Add or delete screenshot URLs for the Top Users gallery.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id} className="relative p-4">
                    <input
                      type="hidden"
                      {...form.register(`top_users.${index}.id`)}
                    />
                     <FormField
                      control={form.control}
                      name={`top_users.${index}.image_url`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Screenshot URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://postimages.org/..."
                              {...field}
                              readOnly // Existing items are not editable, only deletable
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                  append({ image_url: '' }, { shouldFocus: true })
                }
                disabled={isPending}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Screenshot
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save New Screenshots
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
