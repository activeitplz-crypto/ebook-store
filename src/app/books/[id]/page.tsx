export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/header';
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
import { ProductImageGallery } from '@/app/products/[id]/product-image-gallery';

export default async function BookDetailsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  
  // Fetch the current book
  const { data: book, error: bookError } = await supabase
    .from('products') // Using products table for books as well
    .select('*')
    .eq('id', params.id)
    .single();

  if (bookError || !book) {
    notFound();
  }

  // Fetch real reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', params.id)
    .order('created_at', { ascending: false });

  // Fetch "You may also like" books
  const { data: relatedBooks } = await supabase
    .from('products')
    .select('*')
    .neq('id', params.id)
    .limit(4);

  const savings = book.original_price ? book.original_price - book.price : 0;
  
  // Calculate average rating
  const hasReviews = reviews && reviews.length > 0;
  const avgRating = hasReviews 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  // Fetch store settings for footer
  const { data: settings } = await supabase
    .from('site_settings')
    .select('id, value')
    .eq('id', 'store_name')
    .single();
  const storeName = settings?.value || 'JanzyEbooks';

  const images = [
    book.image_url,
    book.image_url_2,
    book.image_url_3
  ].filter(Boolean) as string[];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 md:px-8 py-6 md:py-12">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start mb-12 md:mb-20">
          {/* Gallery Section */}
          <ProductImageGallery images={images} title={book.title} />

          {/* Right: Product Details */}
          <div className="flex flex-col gap-4 md:gap-6">
            {/* Dynamic Scarcity Indicators */}
            <DynamicScarcityIndicators />

            <h1 className="text-2xl md:text-5xl font-bold font-headline text-slate-900 leading-tight">
              {book.title}
            </h1>

            {/* Ratings Summary - Only show if reviews exist */}
            {hasReviews && (
              <div className="flex items-center gap-3">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.round(Number(avgRating)) ? "fill-current" : ""}`} />
                  ))}
                </div>
                <span className="text-sm font-medium text-slate-500">{avgRating} ({reviews.length} reviews)</span>
              </div>
            )}

            {/* Pricing */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3 md:gap-4">
                {book.original_price && (
                  <span className="text-lg md:text-xl text-muted-foreground line-through">
                    Rs.{book.original_price.toLocaleString()}
                  </span>
                )}
                <span className="text-2xl md:text-3xl font-bold text-primary">
                  Rs.{book.price.toLocaleString()} PKR
                </span>
                <Badge className="bg-slate-900 text-white rounded-sm font-bold px-3">Sale</Badge>
              </div>

              {savings > 0 && (
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-100 py-1.5 px-3 flex w-fit items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  You saved Rs.{savings.toLocaleString()}
                </Badge>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              <AddToCartButton product={book} className="h-12 md:h-14 rounded-full border-2 border-slate-900 bg-transparent text-slate-900 hover:bg-slate-50" />
              <CheckoutDialog product={book} />
            </div>

            {/* Description Highlights */}
            <div className="pt-4 md:pt-6">
              <p className="text-slate-600 leading-relaxed italic text-sm md:text-base">
                {book.description || 'Professional grade eBook optimized for your learning journey. Multi-functional digital layout suitable for all devices - Perfect for Daily Use, Travel, and Everyday Carry.'}
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-10 md:my-20" />

        {/* Reviews Section */}
        <section className="mb-12 md:mb-20">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl md:text-2xl font-bold mb-6 md:mb-8">Customer Reviews</h3>
            
            {/* Average Rating Summary - Only show if reviews exist */}
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

            <ReviewForm productId={book.id} />

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
                        <span className="font-bold text-sm md:text-base">{review.name}</span>
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

        {/* Related Products */}
        <section className="pt-10 md:pt-20 border-t">
          <h2 className="text-2xl md:text-4xl font-serif italic mb-8 md:mb-12">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedBooks?.map((related) => (
              <Link key={related.id} href={`/books/${related.id}`} className="group space-y-3 md:space-y-4">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={related.image_url || `https://picsum.photos/seed/${related.id}/400/500`}
                    alt={related.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  {related.original_price && (
                    <Badge className="absolute top-2 left-2 md:top-4 md:left-4 bg-slate-900 text-white rounded-sm text-[10px] md:text-xs">Sale</Badge>
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium text-[13px] md:text-sm line-clamp-1 group-hover:underline">{related.title}</h3>
                  <div className="flex flex-wrap gap-1.5 md:gap-2 text-[12px] md:text-sm">
                    {related.original_price && (
                      <span className="text-muted-foreground line-through">Rs.{related.original_price.toLocaleString()}</span>
                    )}
                    <span className="font-bold">Rs.{related.price.toLocaleString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t bg-slate-50 mt-auto">
        <div className="container px-4 md:px-8 py-8 md:py-12 text-center text-xs md:text-sm text-slate-400 mx-auto leading-relaxed">
          © 2024 {storeName} Store. Trusted by thousands worldwide.
        </div>
      </footer>
    </div>
  );
}
