'use client';

import { useCart } from './cart-provider';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { CheckoutDialog } from './checkout-dialog';

export function CartSheet() {
  const { cart, removeFromCart, totalItems, totalPrice } = useCart();

  // Construct a comma-separated string of product titles with quantities
  const cartTitles = cart
    .map((item) => `${item.title}${item.quantity > 1 ? ` (x${item.quantity})` : ''}`)
    .join(', ');

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
              {totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Your Shopping Cart
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto py-6 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-2">
              <ShoppingCart className="h-12 w-12 opacity-20" />
              <p>Your cart is empty.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4 p-3 rounded-xl bg-muted/30 border border-border/50">
                <div className="relative h-20 w-16 rounded-md overflow-hidden flex-shrink-0">
                  <Image
                    src={item.image_url || 'https://picsum.photos/seed/product/400/600'}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">{item.title}</h4>
                  <p className="text-sm font-bold text-primary">PKR {item.price.toFixed(2)} x {item.quantity}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => removeFromCart(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <SheetFooter className="flex-col gap-4 border-t pt-6">
            <div className="flex justify-between items-center w-full">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-2xl font-bold text-primary">PKR {totalPrice.toFixed(2)}</span>
            </div>
            <CheckoutDialog product={{ title: cartTitles, price: totalPrice }} />
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
