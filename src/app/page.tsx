import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, ShoppingBag, Star, Flame, ArrowRight, HelpCircle } from 'lucide-react';
import placeholderImages from '@/app/lib/placeholder-images.json';
import { createClient } from '@/lib/supabase/server';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { CheckoutDialog } from '@/components/checkout-dialog';
import type { Product, BlogPost, FAQ } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default async function eBookStore() {
  const supabase = await createClient();
  
  const { data: allProducts, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: allReviews } = await supabase
    .from('reviews')
    .select('product_id, rating');

  const { data: settingsData } = await supabase
    .from('site_settings')
    .select('id, value');

  const { data: blogPosts } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);

  const { data: faqs } = await supabase
    .from('faqs')
    .select('*')
    .order('order_index', { ascending: true });
  
  const getSetting = (id: string, fallback: string) => 
    settingsData?.find(s => s.id === id)?.value || fallback;

  const heroBannerUrl = getSetting('hero_banner_url', placeholderImages.books.find(img => img.id === 'hero')?.url || placeholderImages.books[0].url);
  const heroTitle = getSetting('hero_title', ''); 
  const homeHeading = getSetting('home_heading', 'Discover Infinite Knowledge');
  const homeSubheading = getSetting('home_subheading', 'Explore our curated collection of ebooks designed to inspire, educate, and empower your journey toward mastery.');

  const excludedCategories = ['Adventure', 'Environment', 'Mystery', 'Business'];
  const categories = Array.from(new Set(allProducts?.map(p => p.category).filter(Boolean) || []))
    .filter(cat => !excludedCategories.includes(cat as string));

  const ratingsMap = allReviews?.reduce((acc: Record<string, { sum: number; count: number }>, rev) => {
    if (!acc[rev.product_id]) acc[rev.product_id] = { sum: 0, count: 0 };
    acc[rev.product_id].sum += rev.rating;
    acc[rev.product_id].count += 1;
    return acc;
  }, {}) || {};

  const bestSellers = allProducts?.filter(p => p.is_bestseller) || [];
  
  const displayBestSellers = bestSellers.slice(0, 10);
  const displayAllProducts = allProducts?.slice(0, 10) || [];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <div className="p-4 md:p-6 lg:p-8 bg-background">
          <section className="relative w-full aspect-[16/9] md:aspect-[21/7] lg:aspect-[3/1] overflow-hidden bg-slate-900 border-4 md:border-8 border-slate-100 rounded-xl md:rounded-3xl shadow-lg ring-1 ring-slate-200">
            <Image 
              src={heroBannerUrl} 
              alt="Hero Banner" 
              fill 
              className="object-cover opacity-80"
              priority
              data-ai-hint="library banner"
            />
            {heroTitle && heroTitle.trim() !== "" && (
              <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                <h1 className="text-white text-3xl md:text-6xl font-bold font-headline tracking-tight drop-shadow-2xl">
                  {heroTitle}
                </h1>
              </div>
            )}
          </section>
        </div>

        <section className="bg-background py-14 md:py-24">
          <div className="container px-4 md:px-8 mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-7xl font-bold font-headline text-slate-900 tracking-tight leading-[1.1] max-w-4xl mx-auto">
                {homeHeading}
              </h2>
              <div className="w-20 h-1.5 bg-primary mx-auto rounded-full"></div>
            </div>
            <p className="text-lg md:text-2xl text-slate-500 max-w-3xl mx-auto leading-relaxed font-body italic opacity-90">
              {homeSubheading}
            </p>
          </div>
        </section>

        <section className="pb-12 md:pb-20">
          <div className="container px-4 md:px-8 mx-auto space-y-16">
            {error ? (
              <Alert variant="destructive" className="max-w-2xl mx-auto">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Connection Error</AlertTitle>
                <AlertDescription>
                  We couldn't reach your database. Ensure your tables exist.
                </AlertDescription>
              </Alert>
            ) : !allProducts ? (
               <div className="flex flex-col justify-center items-center py-20 gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Connecting to Supabase...</p>
               </div>
            ) : (
              <>
                {bestSellers.length > 0 && (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <Flame className="h-6 w-6 md:h-8 md:w-8 text-orange-500 fill-current" />
                        <h2 className="text-2xl md:text-4xl font-bold font-headline text-slate-900">Best Selling Products</h2>
                      </div>
                      {bestSellers.length > 10 && (
                        <Button variant="ghost" asChild className="text-primary hover:text-primary/80 gap-2">
                          <Link href="/bestsellers">
                            View All <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
                      {displayBestSellers.map((product) => (
                        <ProductCard 
                          key={product.id} 
                          product={product} 
                          rating={ratingsMap[product.id] ? (ratingsMap[product.id].sum / ratingsMap[product.id].count) : null}
                          reviewCount={ratingsMap[product.id]?.count || 0}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                      <h2 className="text-2xl md:text-4xl font-bold font-headline text-slate-900">Our Collection</h2>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {categories.length > 0 && (
                        <div className="hidden md:flex flex-wrap gap-2">
                          <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-white transition-colors">All</Badge>
                          {categories.map((cat) => (
                            <Badge key={cat as string} variant="outline" className="cursor-pointer hover:bg-primary hover:text-white transition-colors">
                              {cat as string}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {allProducts.length > 10 && (
                        <Button variant="ghost" asChild className="text-primary hover:text-primary/80 gap-2">
                          <Link href="/bestsellers">
                            View All <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>

                  {allProducts.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
                      {displayAllProducts.map((product) => (
                        <ProductCard 
                          key={product.id} 
                          product={product} 
                          rating={ratingsMap[product.id] ? (ratingsMap[product.id].sum / ratingsMap[product.id].count) : null}
                          reviewCount={ratingsMap[product.id]?.count || 0}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 md:py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 px-4">
                      <p className="text-muted-foreground text-sm md:text-base">No products found in your inventory.</p>
                    </div>
                  )}
                </div>

                {blogPosts && blogPosts.length > 0 && (
                  <section className="py-12 md:py-20 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                      <div className="relative aspect-video md:aspect-square overflow-hidden rounded-2xl shadow-xl">
                        <Image 
                          src={blogPosts[0].image_url || 'https://picsum.photos/seed/blog/800/800'} 
                          alt={blogPosts[0].title} 
                          fill 
                          className="object-cover"
                          data-ai-hint="blog image"
                        />
                      </div>
                      <div className="space-y-6">
                        <h2 className="text-3xl md:text-5xl font-bold font-headline text-slate-900">{blogPosts[0].title}</h2>
                        <div className="text-lg text-slate-600 whitespace-pre-wrap leading-relaxed">
                          {blogPosts[0].content}
                        </div>
                        <Button asChild size="lg" className="rounded-full px-8">
                          <Link href={blogPosts[0].button_link}>
                            {blogPosts[0].button_text}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </section>
                )}

                {faqs && faqs.length > 0 && (
                  <section className="py-12 md:py-20 border-t">
                    <div className="max-w-3xl mx-auto space-y-8">
                      <div className="text-center space-y-2">
                        <div className="flex items-center justify-center gap-2 mb-2">
                           <HelpCircle className="h-6 w-6 text-primary" />
                           <h2 className="text-3xl md:text-4xl font-bold font-headline text-slate-900 uppercase tracking-wider">Frequently Asked Questions</h2>
                        </div>
                        <p className="text-muted-foreground italic">Find answers to common questions about our platform and services.</p>
                      </div>
                      <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq) => (
                          <AccordionItem key={faq.id} value={faq.id} className="border-b border-slate-200 py-2">
                            <AccordionTrigger className="text-lg font-bold hover:no-underline text-slate-800 text-left">
                              {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-slate-600 leading-relaxed pt-2 pb-4 text-base">
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  </section>
                )}
              </>
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
          <CardTitle className="text-sm md:text-base font-headline line-clamp-2 min-h-[2.5rem] leading-tight text-slate-900">{product.title}</CardTitle>
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
          <p className="text-sm md:text-lg font-bold text-primary">PKR {Number(product.price).toFixed(0)}</p>
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
