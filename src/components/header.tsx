
'use client';

import Link from 'next/link';
import { Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CartSheet } from './cart-sheet';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Header() {
  const [settings, setSettings] = useState<{ name: string; logo: string }>({
    name: 'JanzyEbooks',
    logo: 'https://i.postimg.cc/brsQS29S/Modern-Public-Library-Logo-Template-(1).png'
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase
        .from('site_settings')
        .select('id, value')
        .in('id', ['store_name', 'store_logo_url']);
      
      if (data) {
        const name = data.find(s => s.id === 'store_name')?.value || 'JanzyEbooks';
        const logo = data.find(s => s.id === 'store_logo_url')?.value || 'https://i.postimg.cc/brsQS29S/Modern-Public-Library-Logo-Template-(1).png';
        setSettings({ name, logo });
      }
    }
    fetchSettings();
  }, [supabase]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/bestsellers", label: "Best selling" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8 mx-auto">
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[250px] sm:w-[300px]">
              <SheetHeader>
                <SheetTitle className="text-left font-serif italic text-primary">
                  {settings.name}
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-medium hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo and Name - Left Aligned */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative h-9 w-9 md:h-10 md:w-10 overflow-hidden rounded-full shrink-0">
              <Image 
                src={settings.logo} 
                alt={settings.name} 
                fill 
                className="object-contain"
                data-ai-hint="store logo"
                priority
              />
            </div>
            <span className="font-serif italic text-lg md:text-2xl font-bold tracking-tight text-primary group-hover:opacity-80 transition-opacity whitespace-nowrap">
              {settings.name}
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-primary transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions (Search and Cart) */}
        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search products..." className="pl-9 w-[150px] lg:w-[250px] bg-muted/50 border-none rounded-full h-9 text-sm" />
          </div>
          <CartSheet />
        </div>
      </div>
    </header>
  );
}
