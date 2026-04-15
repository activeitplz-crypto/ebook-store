'use client';

import { useState, useTransition } from 'react';
import { adminLogin } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const [password, setPassword] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await adminLogin(password);
      if (result.success) {
        toast({ title: 'Welcome back!', description: 'Access granted.' });
        router.refresh();
      } else {
        toast({
          variant: 'destructive',
          title: 'Access Denied',
          description: result.error,
        });
      }
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-none">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold font-headline">Admin Sales Portal</CardTitle>
          <CardDescription>Enter the master password to view store earnings.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 text-center text-lg tracking-widest"
            />
            <Button type="submit" className="w-full h-12 text-base font-bold" disabled={isPending}>
              {isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : 'UNLOCK DASHBOARD'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
