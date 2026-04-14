export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle2 } from 'lucide-react';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { CheckoutDialog } from '@/components/checkout-dialog';
import { DynamicScarcityIndicators } from '@/components/dynamic-scarcity-indicators';
import { ReviewForm } from '@/components/review-form';
import { ProductImageGallery } from './product-image-gallery';

export default async function ProductDetailsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', params.id)
    .single();

  if (productError || !product) {
    notFound();
  }

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', params.id)
    .order('created_at', { ascending: false });

  const { data: relatedProducts } = await supabase
    .from('products')
    .select('*')
    .neq('id', params.id)
    .limit(4);

  const savings = product.original_price && product.original_price > product.price 
    ? product.original_price - product.price 
    : 0;

  const discount = product.original_price && product.original_price > product.price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100) 
    : null;
  
  const hasReviews = reviews && reviews.length > 0;
  const avgRating = hasReviews 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const images = [
    product.image_url,
    product.image_url_2,
    product.image_url_3
  ].filter(Boolean) as string[];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 md:px-8 py-6 md:py-12">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start mb-12 md:mb-20">
          {/* Product Gallery */}
          <ProductImageGallery images={images} title={product.title} />

          <div className="flex flex-col gap-4 md:gap-6">
            <DynamicScarcityIndicators />

            <h1 className="text-2xl md:text-5xl font-bold font-headline text-slate-900 leading-tight">
              {product.title}
            </h1>

            {hasReviews && (
              <div className="flex items-center gap-2">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.round(Number(avgRating)) ? "fill-current" : ""}`} />
                  ))}
                </div>
                <span className="text-sm font-medium text-slate-500">({reviews.length})</span>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3 md:gap-4">
                {product.original_price && product.original_price > product.price && (
                  <span className="text-lg md:text-xl text-muted-foreground line-through">
                    Rs.{product.original_price.toLocaleString()}
                  </span>
                )}
                <span className="text-2xl md:text-3xl font-bold text-primary">
                  Rs.{product.price.toLocaleString()} PKR
                </span>
                {discount ? (
                  <Badge className="bg-red-600 text-white rounded-sm font-bold px-3 py-1">
                    {discount}% OFF
                  </Badge>
                ) : (
                  <Badge className="bg-slate-900 text-white rounded-sm font-bold px-3 py-1">
                    SALE
                  </Badge>
                )}
              </div>

              {savings > 0 && (
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-100 py-1.5 px-3 flex w-fit items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  You saved Rs.{savings.toLocaleString()}
                </Badge>
              )}
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <AddToCartButton product={product} className="h-12 md:h-14 rounded-full border-2 border-slate-900 bg-transparent text-slate-900 hover:bg-slate-50" />
              <CheckoutDialog 
                product={product} 
                trigger={<button className="w-full h-12 md:h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-colors">Buy Now</button>}
              />
            </div>

            <div className="pt-4 md:pt-6">
              <div className="text-slate-600 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
                {product.description || 'Professional grade product optimized for your journey.'}
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-10 md:my-20" />

        <section className="mb-12 md:mb-20">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 text-slate-900">Customer Reviews</h3>
            
            {hasReviews && (
              <div className="flex items-center gap-4 mb-8 md:mb-10">
                <div className="text-4xl md:text-5xl font-bold">{avgRating}</div>
                <div className="flex flex-col">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 md:h-5 md:w-5 ${i < Math.round(Number(avgRating)) ? "fill-current" : ""}`} />
                    ))}
                  </div>
                  <span className="text-xs md:text-sm text-muted-foreground">{reviews.length} customer reviews</span>
                </div>
              </div>
            )}

            <ReviewForm productId={product.id} />

            <div className="space-y-8 md:space-y-12">
              {hasReviews ? (
                reviews.map((review) => (
                  <div key={review.id} className="flex gap-3 md:gap-4 border-b pb-6 md:pb-8 last:border-0">
                    <Avatar className="h-10 w-10 md:h-12 md:w-12 bg-slate-100">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                        {review.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1.5 md:space-y-2 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm md:text-base text-slate-900">{review.name}</span>
                      </div>
                      <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-current" : ""}`} />
                        ))}
                      </div>
                      <p className="text-slate-600 leading-relaxed text-sm md:text-base">{review.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 md:py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <p className="text-muted-foreground text-sm">No reviews yet. Be the first to share your experience!</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="pt-10 md:pt-20 border-t">
          <h2 className="text-2xl md:text-4xl font-headline font-bold text-slate-900 mb-8 md:mb-12">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts?.map((related) => (
              <Link key={related.id} href={`/products/${related.id}`} className="group space-y-3 md:space-y-4">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={related.image_url || `https://picsum.photos/seed/${related.id}/400/500`}
                    alt={related.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  {(related.original_price && related.original_price > related.price) ? (
                    <Badge className="absolute top-2 left-2 md:top-4 md:left-4 bg-red-600 text-white rounded-sm text-[10px] md:text-xs">
                      {Math.round(((related.original_price - related.price) / related.original_price) * 100)}% OFF
                    </Badge>
                  ) : (
                    <Badge className="absolute top-2 left-2 md:top-4 md:left-4 bg-slate-900 text-white rounded-sm text-[10px] md:text-xs">SALE</Badge>
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-[13px] md:text-sm line-clamp-1 group-hover:underline text-slate-900">{related.title}</h3>
                  <div className="flex flex-wrap gap-1.5 md:gap-2 text-[12px] md:text-sm">
                    {related.original_price && related.original_price > related.price && (
                      <span className="text-muted-foreground line-through">Rs.{related.original_price.toLocaleString()}</span>
                    )}
                    <span className="font-bold text-primary">Rs.{related.price.toLocaleString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
