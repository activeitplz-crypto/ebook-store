import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/components/cart-provider';
import { Toaster } from '@/components/ui/toaster';
import { FloatingWhatsApp } from '@/components/floating-whatsapp';

export const metadata: Metadata = {
  title: 'JanzyEbooks Store',
  description: 'Your premium destination for knowledge and adventure.',
  icons: {
    icon: 'https://i.postimg.cc/4NycZngc/In-Shot-20250828-122821151.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <CartProvider>
          {children}
          <FloatingWhatsApp />
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
