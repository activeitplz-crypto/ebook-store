
'use client';

import { useCart } from './cart-provider';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/types';

export function AddToCartButton({ product, size = 'default', className }: { product: Product, size?: 'default' | 'lg', className?: string }) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast({
      title: 'Added to Cart',
      description: `${product.title} has been added to your shopping cart.`,
    });
  };

  return (
    <Button 
      onClick={handleAdd} 
      className={`rounded-full gap-2 w-full ${className}`}
      size={size}
    >
      <ShoppingCart className="h-4 w-4" />
      Add to Cart
    </Button>
  );
}
