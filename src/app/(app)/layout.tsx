
'use client';

import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import {
  Home,
  Wallet,
  ClipboardList,
  LogOut,
  User as UserIcon,
  Loader2,
  FileCheck2,
  ImageIcon,
  Users,
  Award,
  MessageSquare,
  HelpCircle,
  Video,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ProAssignmentIcon } from '@/components/pro-assignment-icon';
import { MobileNav } from '@/components/mobile-nav';
import { logout } from '@/app/auth/actions';
import { UserNav } from '@/components/user-nav';
import { useRouter } from 'next/navigation';
import type { Profile } from '@/lib/types';
import type { Session } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSessionData = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      
      if (!currentSession) {
        router.push('/login');
        return;
      }
      
      // Redirect admin away from user dashboard
      if (currentSession.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        router.push('/admin');
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentSession.user.id)
        .single();
      
      if (error || !profile) {
        console.error('Error fetching profile:', error);
        // Could redirect or show an error state
      } else {
        setUser(profile);
      }
      setLoading(false);
    };

    getSessionData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (!session) {
            router.push('/login');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router, supabase, supabase.auth]);


  if (loading) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin" />
        </div>
    )
  }
  
  if (!session || !user) {
    return null; // Or a redirect component
  }
  
  const navItems = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/assignments', label: 'Assignments', icon: FileCheck2 },
    { href: '/withdraw', label: 'Withdrawal', icon: Wallet },
    { href: '/tasks', label: 'View Tasks', icon: ClipboardList },
    { href: '/watch', label: 'Guidelines', icon: Video },
  ];

  const actionItems = [
    { href: '/guide', label: 'Guide', icon: HelpCircle },
    { href: '/top-users', label: 'Top Users', icon: Award },
    { href: '/reviews', label: 'Reviews', icon: MessageSquare },
    { href: 'https://postimages.org/', label: 'Postimages', icon: ImageIcon, target: '_blank' },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground md:pl-60">
      <nav className="hidden md:fixed md:left-0 md:top-0 md:z-50 md:flex md:h-screen md:w-60 md:flex-col md:border-r">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <ProAssignmentIcon className="h-8 w-8" />
          <span className="text-sm font-bold">ProAssignment</span>
        </div>
        <div className="flex flex-1 flex-col justify-between overflow-auto py-4">
          <div className="flex flex-col gap-2 px-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
          <div className="mt-auto flex flex-col gap-2 px-4">
             {actionItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                target={item.target}
                rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
            <form action={logout}>
                <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                    <LogOut className="h-5 w-5" />
                    <span>Log out</span>
                </button>
            </form>
          </div>
        </div>
      </nav>

       <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background/95 px-4 backdrop-blur-sm md:justify-end md:px-6">
        <div className="flex items-center gap-2 md:hidden">
            <ProAssignmentIcon className="h-7 w-7" />
            <span className="font-bold">ProAssignment</span>
        </div>

        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
                <Link href="/plans">Plans</Link>
            </Button>
            <MobileNav navItems={navItems} actionItems={actionItems} />
        </div>
      </header>
      <main className="flex-1 p-4 lg:p-6">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur-sm md:hidden">
        <div className="flex h-16 items-center justify-around">
          {navItems.filter(item => item.href !== '/watch').map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 p-2 text-muted-foreground'
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
