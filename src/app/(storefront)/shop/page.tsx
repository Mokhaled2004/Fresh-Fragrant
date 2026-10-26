import { and, asc, desc, eq, gt, isNotNull, isNull, lte, or } from 'drizzle-orm';
import { db } from '@/db';
import { categories, offerCategories, offerProducts, offerVariants, offers, productVariants, products } from '@/db/schema';
import OffersShowcase from '@/components/landing/OffersShowcase';
import ShopCatalog from '@/components/shop/ShopCatalog';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string; sale?: string }> }) {
  const params = await searchParams;
  const now = new Date();
  const liveOffer = and(eq(offers.isActive, true), or(isNull(offers.startAt), lte(offers.startAt, now)), or(isNull(offers.endAt), gt(offers.endAt, now)));
  
  const [catalog, categoryRows, variants, timedOffers, directOfferProducts, categoryOfferProducts, variantOfferProducts] = await Promise.all([
    db.select({ id: products.id, sku: products.sku, slug: products.slug, name: products.name, description: products.description, price: products.price, compareAtPrice: products.compareAtPrice, stock: products.stock, weight: products.weight, dimensions: products.dimensions, imageUrl: products.imageUrl, galleryUrls: products.galleryUrls, categoryId: products.categoryId, rating: products.rating, ratingCount: products.ratingCount, isFeatured: products.isFeatured, metadata: products.metadata, createdAt: products.createdAt, categoryName: categories.name, categorySlug: categories.slug })
      .from(products).leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(isNull(products.deletedAt), eq(products.isActive, true))).orderBy(desc(products.isFeatured), desc(products.createdAt)),
    db.select({ id: categories.id, name: categories.name, slug: categories.slug }).from(categories).where(and(eq(categories.isActive, true), isNull(categories.deletedAt))).orderBy(asc(categories.displayOrder), asc(categories.name)),
    db.select({ id: productVariants.id, productId: productVariants.productId, sku: productVariants.sku, price: productVariants.price, stock: productVariants.stock, imageUrl: productVariants.imageUrl, metadata: productVariants.metadata, isActive: productVariants.isActive }).from(productVariants).where(eq(productVariants.isActive, true)),
    db.select({ id: offers.id, name: offers.name, description: offers.description, type: offers.type, value: offers.value, couponCode: offers.couponCode, startAt: offers.startAt, endAt: offers.endAt, metadata: offers.metadata }).from(offers)
      .where(and(eq(offers.isActive, true), isNotNull(offers.endAt), or(isNull(offers.startAt), lte(offers.startAt, now)), gt(offers.endAt, now))).orderBy(asc(offers.endAt)).limit(10),
    db.select({ productId: offerProducts.productId }).from(offerProducts).innerJoin(offers, eq(offerProducts.offerId, offers.id)).where(liveOffer),
    db.select({ productId: products.id }).from(offerCategories).innerJoin(offers, eq(offerCategories.offerId, offers.id)).innerJoin(products, eq(offerCategories.categoryId, products.categoryId)).where(and(liveOffer, eq(products.isActive, true), isNull(products.deletedAt))),
    db.select({ productId: productVariants.productId }).from(offerVariants).innerJoin(offers, eq(offerVariants.offerId, offers.id)).innerJoin(productVariants, eq(offerVariants.variantId, productVariants.id)).where(and(liveOffer, eq(productVariants.isActive, true))),
  ]);

  const productsForShop = catalog.map((product) => ({ ...product, createdAt: product.createdAt.toISOString(), variants: variants.filter((variant) => variant.productId === product.id) }));
  const offeredProductIds = [...new Set([...directOfferProducts, ...categoryOfferProducts, ...variantOfferProducts].map((entry) => entry.productId))];
  const offersForDisplay = timedOffers.map((offer) => ({ ...offer, endAt: offer.endAt!.toISOString() }));

  return (
    <main className="bg-white pb-16">
      
      {/* --- FULL BANNER WITH BACKGROUND IMAGE --- */}
      <div className="relative w-full overflow-hidden border-b border-[var(--theme-border)] min-h-[320px] sm:min-h-[400px] flex items-center">
        
        {/* Full Background Image */}
        <Image
          src="https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?q=80&w=2000&auto=format&fit=crop"
          alt="Natural botanical collection"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center z-0"
        />

        {/* Gradient Overlay (fades from dark on the left to transparent on the right) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />

        <div className="relative z-20 mx-auto w-full max-w-[1400px] px-6 sm:px-10 lg:px-16 py-16">
          <div className="max-w-xl">
            <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-white/80">
              Find your fit
            </div>
            <h1 className="text-[41px] sm:text-[51px] font-medium text-white leading-[0.95] tracking-tight mb-4">
              The Shop
            </h1>
            <p className="text-[16px] leading-[1.5] text-white/90">
              Explore the full collection of handcrafted natural soaps, botanical conditioners, and zero-waste essentials.
            </p>
          </div>
        </div>
      </div>

      {offersForDisplay.length > 0 && (
        <div className="mb-12 pt-8">
          <OffersShowcase offers={offersForDisplay} />
        </div>
      )}

      <ShopCatalog 
        products={productsForShop} 
        categories={categoryRows} 
        initialCategory={params.category ?? ''} 
        initialSale={params.sale === 'true'} 
        offeredProductIds={offeredProductIds}
      />
      
    </main>
  );
}