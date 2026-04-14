
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, User } from 'lucide-react';
import type { Review } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default async function ReviewsPage() {
  const supabase = createClient();
  const { data: { session }} = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
    return <div>Could not load reviews. Please try again later.</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2 text-3xl">
            <MessageSquare className="h-8 w-8 text-primary" />
            Customer Reviews
          </CardTitle>
          <CardDescription>
            See what our users are saying about their experience with ProAssignment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reviews && reviews.length > 0 ? (
            <div className="space-y-6">
              {(reviews as Review[]).map((review) => (
                <Card key={review.id} className="bg-muted/50">
                  <CardContent className="p-6">
                    <blockquote className="border-l-4 border-primary pl-4">
                      <p className="text-lg italic text-foreground">
                        “{review.content}”
                      </p>
                    </blockquote>
                    <div className="mt-4 flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-primary/50">
                            <AvatarFallback>
                                {review.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                        </Avatar>
                        <cite className="text-md not-italic font-semibold text-foreground">
                          {review.name}
                        </cite>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex h-48 flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted">
                <p className="text-center text-muted-foreground">
                    No reviews have been added yet.
                    <br />
                    Check back soon to see what our users think!
                </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
