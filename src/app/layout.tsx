import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/components/cart-provider';
import { Toaster } from '@/components/ui/toaster';
import { FloatingWhatsApp } from '@/components/floating-whatsapp';

export const metadata: Metadata = {
  title: 'JanzyEbooks Store',
  description: 'Your premium destination for knowledge and adventure.',
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
