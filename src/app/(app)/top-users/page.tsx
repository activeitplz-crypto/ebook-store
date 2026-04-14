
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award } from 'lucide-react';
import Image from 'next/image';
import type { TopUser } from '@/lib/types';

export default async function TopUsersPage() {
  const supabase = createClient();
  const { data: { session }} = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const { data: topUsers, error } = await supabase
    .from('top_users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching top users:', error);
    return <div>Could not load top user screenshots. Please try again later.</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2 text-3xl">
            <Award className="h-8 w-8 text-primary" />
            Our Top Users
          </CardTitle>
          <CardDescription>
            These are screenshots from some of our top-performing users. Your success could be featured here too!
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topUsers && topUsers.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {(topUsers as TopUser[]).map((user) => (
                <div key={user.id} className="group relative overflow-hidden rounded-lg border bg-muted p-2 shadow-md transition-transform hover:scale-105">
                  <Image
                    src={user.image_url}
                    alt="Top user account screenshot"
                    width={300}
                    height={500}
                    className="h-full w-full object-contain"
                    data-ai-hint="user screenshot"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-48 flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted">
                <p className="text-center text-muted-foreground">
                    Our Top Users list is being updated.
                    <br />
                    Check back soon to see the screenshots!
                </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
