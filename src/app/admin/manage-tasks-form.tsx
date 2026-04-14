
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
import { saveTask, deleteTask } from './actions';
import type { Task } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const taskSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Task title is required'),
  url: z.string().url({ message: 'Please enter a valid URL.' }),
});

const formSchema = z.object({
  tasks: z.array(taskSchema),
});

interface ManageTasksFormProps {
  tasks: Task[];
}

export function ManageTasksForm({ tasks: initialTasks }: ManageTasksFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tasks: initialTasks.slice(0, 10) || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'tasks',
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      for (const task of values.tasks) {
        const result = await saveTask(task);
        if (result?.error) {
          toast({
            variant: 'destructive',
            title: `Failed to save "${task.title}"`,
            description: result.error,
          });
          return;
        }
      }
      toast({
        title: 'Success',
        description: 'All task changes have been saved.',
      });
    });
  }
  
  const handleRemove = (index: number) => {
    const task = fields[index];
    if (task.id) {
        startTransition(async () => {
            const formData = new FormData();
            formData.append('id', task.id as string);
            const result = await deleteTask(formData);
             if (result?.error) {
                toast({ variant: 'destructive', title: 'Deletion Failed', description: result.error });
            } else {
                remove(index);
                toast({ title: 'Task Deleted' });
            }
        });
    } else {
        remove(index);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage User Tasks</CardTitle>
        <CardDescription>
          Add, edit, or delete tasks for users. You can add up to 10 tasks.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id} className="relative p-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <input
                      type="hidden"
                      {...form.register(`tasks.${index}.id`)}
                    />
                    <FormField
                      control={form.control}
                      name={`tasks.${index}.title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Task Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Watch Video" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`tasks.${index}.url`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Task URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://example.com/task"
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
                  append({ title: '', url: '' }, { shouldFocus: true })
                }
                disabled={fields.length >= 10 || isPending}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Task
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save All Changes
              </Button>
            </div>
             {fields.length >= 10 && (
                <p className="text-sm text-destructive">You have reached the maximum limit of 10 tasks.</p>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
