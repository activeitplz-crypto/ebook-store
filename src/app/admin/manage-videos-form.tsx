
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
import { saveVideo, deleteVideo } from './actions';
import type { Video } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const videoSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Video title is required'),
  url: z.string().url({ message: 'Please enter a valid URL.' }),
});

const formSchema = z.object({
  videos: z.array(videoSchema),
});

interface ManageVideosFormProps {
  videos: Video[];
}

export function ManageVideosForm({ videos: initialVideos }: ManageVideosFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videos: initialVideos || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'videos',
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      let successCount = 0;
      for (const video of values.videos) {
        const result = await saveVideo(video);
        if (result?.error) {
          toast({
            variant: 'destructive',
            title: `Failed to save "${video.title}"`,
            description: result.error,
          });
        } else {
          successCount++;
        }
      }
       if(successCount > 0) {
        toast({
            title: 'Success',
            description: 'Video changes have been saved.',
        });
      }
    });
  }
  
  const handleRemove = (index: number) => {
    const video = fields[index];
    if (video.id) {
        startTransition(async () => {
            const formData = new FormData();
            formData.append('id', video.id as string);
            const result = await deleteVideo(formData);
             if (result?.error) {
                toast({ variant: 'destructive', title: 'Deletion Failed', description: result.error });
            } else {
                remove(index);
                toast({ title: 'Video Deleted' });
            }
        });
    } else {
        remove(index);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Guideline Videos</CardTitle>
        <CardDescription>
          Add, edit, or delete videos that appear on the "Guidelines" page.
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
                      {...form.register(`videos.${index}.id`)}
                    />
                    <FormField
                      control={form.control}
                      name={`videos.${index}.title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Video Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., How to get started" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`videos.${index}.url`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Video URL (YouTube)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://www.youtube.com/watch?v=..."
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
                disabled={isPending}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Video
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save All Changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
