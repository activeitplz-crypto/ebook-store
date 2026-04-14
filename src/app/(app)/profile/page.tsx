
import { createClient } from '@/lib/supabase/server';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { UserProfileCard } from '@/components/user-profile-card';
import { ProfileForm } from './profile-form';
import { redirect } from 'next/navigation';
import { Label } from '@/components/ui/label';

export default async function ProfilePage() {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const { data: user, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
  
  if (error || !user) {
    return <div>Error loading profile. Please try again.</div>;
  }

  return (
    <div className="space-y-6">
      <UserProfileCard 
        name={user.name || 'Anonymous'}
        username={user.email?.split('@')[0] || 'anonymous'}
        avatarUrl={user.avatar_url}
      />

       <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
          <CardDescription>
            These are your account details and cannot be changed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <p className="rounded-md border bg-muted px-3 py-2 text-sm text-foreground">
              {user.name || 'N/A'}
            </p>
          </div>
           <div className="space-y-2">
            <Label>Email Address</Label>
             <p className="rounded-md border bg-muted px-3 py-2 text-sm text-foreground">
              {user.email || 'N/A'}
            </p>
          </div>
           <div className="space-y-2">
            <Label>User ID</Label>
            <p className="break-all rounded-md border bg-muted px-3 py-2 text-sm text-foreground">
              {user.id}
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Update your name and profile picture here.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm user={user} />
        </CardContent>
      </Card>
    </div>
  );
}
