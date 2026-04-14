import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, Flame, Star } from 'lucide-react';
import placeholderImages from '@/app/lib/placeholder-images.json';
import { createClient } from '@/lib/supabase/server';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { CheckoutDialog } from '@/components/checkout-dialog';
import type { Product } from '@/lib/types';

export default async function BestsellersPage() {
  const supabase = await createClient();
  
  const { data: bestSellers, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_bestseller', true)
    .order('created_at', { ascending: false });

  const { data: allReviews } = await supabase
    .from('reviews')
    .select('product_id, rating');

  // Map ratings to products
  const ratingsMap = allReviews?.reduce((acc: Record<string, { sum: number; count: number }>, rev) => {
    if (!acc[rev.product_id]) acc[rev.product_id] = { sum: 0, count: 0 };
    acc[rev.product_id].sum += rev.rating;
    acc[rev.product_id].count += 1;
    return acc;
  }, {}) || {};

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <section className="py-12 md:py-20">
          <div className="container px-4 md:px-8 mx-auto">
            {error ? (
              <Alert variant="destructive" className="max-w-2xl mx-auto">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Connection Error</AlertTitle>
                <AlertDescription>
                  We couldn't reach your database. Ensure your products table exists.
                </AlertDescription>
              </Alert>
            ) : !bestSellers ? (
               <div className="flex flex-col justify-center items-center py-20 gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Connecting to Supabase...</p>
               </div>
            ) : bestSellers.length > 0 ? (
              <>
                <div className="flex items-center gap-3 mb-12">
                  <Flame className="h-8 w-8 md:h-10 md:w-10 text-orange-500 fill-current" />
                  <h2 className="text-3xl md:text-5xl font-bold font-headline text-slate-900 tracking-tight">Best Selling Products</h2>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                  {bestSellers.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      rating={ratingsMap[product.id] ? (ratingsMap[product.id].sum / ratingsMap[product.id].count) : null}
                      reviewCount={ratingsMap[product.id]?.count || 0}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 px-4">
                <p className="text-muted-foreground">No best selling products found. Check back later!</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function ProductCard({ product, rating, reviewCount }: { product: Product, rating: number | null, reviewCount: number }) {
  const discount = product.original_price && product.original_price > product.price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100) 
    : null;

  return (
    <Card className="group border-none shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl md:rounded-2xl overflow-hidden bg-card flex flex-col h-full">
      <Link href={`/products/${product.id}`} className="relative aspect-square overflow-hidden block">
        <Image 
          src={product.image_url || placeholderImages.books[0].url} 
          alt={product.title} 
          fill 
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          data-ai-hint="product image"
        />
        <div className="absolute top-2 left-2 md:top-4 md:left-4 flex flex-col gap-1 md:gap-2">
           {discount ? (
            <Badge className="bg-red-600 text-white border-none shadow-sm font-bold text-[10px] md:text-xs">
              {discount}% OFF
            </Badge>
          ) : (
            <Badge className="bg-slate-900 text-white border-none shadow-sm font-bold text-[10px] md:text-xs">
              SALE
            </Badge>
          )}
        </div>
      </Link>
      <CardHeader className="p-3 md:p-4 pb-1 md:pb-2">
        <Link href={`/products/${product.id}`} className="hover:text-primary transition-colors">
          <CardTitle className="text-sm md:text-lg font-headline line-clamp-2 min-h-[2.5rem] leading-tight text-slate-900">{product.title}</CardTitle>
        </Link>
        <div className="flex items-center gap-1 mt-1">
          <div className="flex text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-3 w-3 ${i < Math.round(rating || 0) ? "fill-current" : ""}`} />
            ))}
          </div>
          <span className="text-[10px] md:text-xs text-muted-foreground">({reviewCount})</span>
        </div>
      </CardHeader>
      <CardContent className="p-3 md:p-4 pt-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
           {product.original_price && product.original_price > product.price && (
            <span className="text-[10px] md:text-xs text-muted-foreground line-through">
              PKR {Number(product.original_price).toFixed(0)}
            </span>
          )}
          <p className="text-sm md:text-xl font-bold text-primary">PKR {Number(product.price).toFixed(0)}</p>
        </div>
      </CardContent>
      <CardFooter className="p-3 md:p-4 pt-0 flex flex-col gap-2">
        <AddToCartButton product={product} className="h-8 md:h-10 text-[11px] md:text-sm py-0" />
        <CheckoutDialog 
          product={product} 
          trigger={<button className="w-full h-8 md:h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full text-[11px] md:text-sm transition-colors">Buy Now</button>} 
        />
      </CardFooter>
    </Card>
  );
}
