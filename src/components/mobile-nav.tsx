
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { ProAssignmentIcon } from '@/components/pro-assignment-icon';
import { cn } from '@/lib/utils';
import { logout } from '@/app/auth/actions';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  target?: string;
}

interface MobileNavProps {
  navItems: NavItem[];
  actionItems: NavItem[];
}

export function MobileNav({ navItems, actionItems }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ProAssignmentIcon className="h-8 w-8" />
            <span className="text-xl font-bold">ProAssignment</span>
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1">
            <nav className="flex flex-col gap-2 p-4">
            {navItems.map((item) => (
                <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                    pathname === item.href && 'bg-muted text-primary'
                )}
                >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
                </Link>
            ))}
            </nav>
        </div>
        <SheetFooter className="flex-col-reverse items-start gap-2 p-4 sm:flex-col-reverse sm:items-start sm:gap-2">
             <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                    pathname === '/profile' && 'bg-muted text-primary'
                )}
                >
                <User className="h-5 w-5" />
                <span>Edit Profile</span>
            </Link>
            {actionItems.map((item) => (
                <Link
                key={item.href}
                href={item.href}
                target={item.target}
                rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
                onClick={() => setOpen(false)}
                className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary'
                )}
                >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
                </Link>
            ))}
            <form action={logout} className="w-full">
                <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                    <LogOut className="h-5 w-5" />
                    <span>Log out</span>
                </button>
            </form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
