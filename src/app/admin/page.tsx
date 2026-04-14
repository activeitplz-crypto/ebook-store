import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { createClient } from '@/lib/supabase/server';
import { ManagePlansForm } from './manage-plans-form';
import { PaymentsTable } from './payments-table';
import { WithdrawalsTable } from './withdrawals-table';
import { UsersTable } from './users-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ManageTasksForm } from './manage-tasks-form';
import { AssignmentsTable } from './assignments-table';
import { ManageTopUsersForm } from './manage-top-users-form';
import { ManageReviewsForm } from './manage-reviews-form';
import { ManageVideosForm } from './manage-videos-form';
import type { Plan, Task, TopUser, Review, Video } from '@/lib/types';


export default async function AdminPage({
  searchParams,
}: {
  searchParams: { tab: string | undefined };
}) {
  const defaultTab = searchParams.tab || 'assignments';
  const supabase = await createClient();
  
  const { data: plansData } = await supabase.from('plans').select('*').order('investment');
  const plans: Plan[] = plansData || [];

  const { data: tasksData } = await supabase.from('tasks').select('*').order('created_at');
  const tasks: Task[] = tasksData || [];

  const { data: topUsersData } = await supabase.from('top_users').select('*').order('created_at', { ascending: false });
  const topUsers: TopUser[] = topUsersData || [];

  const { data: reviewsData } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
  const reviews: Review[] = reviewsData || [];

  const { data: videosData } = await supabase.from('videos').select('*').order('created_at', { ascending: false });
  const videos: Video[] = videosData || [];

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="grid w-full grid-cols-9">
        <TabsTrigger value="assignments">Assignments</TabsTrigger>
        <TabsTrigger value="payments">Plan Payments</TabsTrigger>
        <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
        <TabsTrigger value="users">All Users</TabsTrigger>
        <TabsTrigger value="plans">Manage Plans</TabsTrigger>
        <TabsTrigger value="tasks">Manage Tasks</TabsTrigger>
        <TabsTrigger value="top-users">Top Users</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
        <TabsTrigger value="videos">Guidelines</TabsTrigger>
      </TabsList>

      <TabsContent value="assignments">
        <AssignmentsTable />
      </TabsContent>

      <TabsContent value="payments">
        <PaymentsTable />
      </TabsContent>

      <TabsContent value="withdrawals">
        <WithdrawalsTable />
      </TabsContent>
      
      <TabsContent value="users">
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>A complete list of all registered users in the system.</CardDescription>
          </CardHeader>
          <CardContent>
            <UsersTable />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="plans">
        <ManagePlansForm plans={plans} />
      </TabsContent>

      <TabsContent value="tasks">
        <ManageTasksForm tasks={tasks} />
      </TabsContent>
      
      <TabsContent value="top-users">
        <ManageTopUsersForm topUsers={topUsers} />
      </TabsContent>
      
      <TabsContent value="reviews">
        <ManageReviewsForm reviews={reviews} />
      </TabsContent>
      
      <TabsContent value="videos">
        <ManageVideosForm videos={videos} />
      </TabsContent>
    </Tabs>
  );
}
