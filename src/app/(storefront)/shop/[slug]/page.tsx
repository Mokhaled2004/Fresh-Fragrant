import { db } from '@/db';
import { products, productVariants, categories } from '@/db/schema';
import { eq, and, isNull, ne } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ArrowLeft } from 'lucide-react';
import ProductDetailsClient from './ProductDetailsClient'; 
import RelatedProducts from '@/components/shop/RelatedProducts'; // <-- Import the new component

export const dynamic = 'force-dynamic';

export default async function ProductDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [product] = await db.select({
    id: products.id,
    name: products.name,
    slug: products.slug,
    description: products.description,
    price: products.price,
    compareAtPrice: products.compareAtPrice,
    imageUrl: products.imageUrl,
    galleryUrls: products.galleryUrls,
    stock: products.stock,
    rating: products.rating,
    ratingCount: products.ratingCount,
    categoryId: products.categoryId,
    categoryName: categories.name,
    sku: products.sku,
    isFeatured: products.isFeatured,
  })
  .from(products)
  .leftJoin(categories, eq(products.categoryId, categories.id))
  .where(and(eq(products.slug, slug), isNull(products.deletedAt), eq(products.isActive, true)))
  .limit(1);

  if (!product) notFound();

  const variants = await db.select().from(productVariants).where(
    and(eq(productVariants.productId, product.id), eq(productVariants.isActive, true))
  );

  // Fetch Related Products
  let relatedProducts: any[] = [];
  if (product.categoryId) {
    relatedProducts = await db.select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      imageUrl: products.imageUrl,
      stock: products.stock,
      rating: products.rating,
      ratingCount: products.ratingCount,
      isFeatured: products.isFeatured,
    })
    .from(products)
    .where(
      and(
        eq(products.categoryId, product.categoryId),
        ne(products.id, product.id),
        isNull(products.deletedAt),
        eq(products.isActive, true)
      )
    )
    .limit(4);
  }

  // Attach variants to related products so the card renders correctly
  const relatedProductIds = relatedProducts.map(p => p.id);
  const relatedVariants = relatedProductIds.length > 0 
    ? await db.select().from(productVariants).where(eq(productVariants.isActive, true))
    : [];

  const formattedRelatedProducts = relatedProducts.map(p => ({
    ...p,
    variants: relatedVariants.filter(v => v.productId === p.id)
  }));

  const discounted = product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price);

  return (
    <main className="bg-white min-h-screen pb-20">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 pt-8">
        
        <div className="flex items-center justify-between mb-8">
          <Link href="/shop" className="inline-flex items-center gap-2 text-[13px] font-medium text-gray-500 hover:text-[#5433EB] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Products
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 mb-16">
          
          {/* Left: Images */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#F8F6F4] border border-gray-100">
              {product.imageUrl ? (
                <Image src={product.imageUrl} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" priority />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image Available</div>
              )}
            </div>
          </div>

          {/* Right: Info & Add to Cart */}
          <div className="flex flex-col justify-start">
            
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#5433EB] mb-2">
              {product.categoryName || "Our Collection"}
            </p>
            
            <h1 className="text-[32px] sm:text-[40px] font-medium text-black leading-tight mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.round(Number(product.rating || 0)) ? "fill-[#5433EB] text-[#5433EB]" : "fill-gray-200 text-gray-200"}`} />
                ))}
              </div>
              <span className="text-[13px] text-gray-500">({product.ratingCount} reviews)</span>
            </div>

            <div className="flex items-end gap-3 mb-8">
              <span className="text-[28px] font-bold text-[#5433EB]">${Number(product.price).toFixed(2)}</span>
              {discounted && (
                <span className="text-[18px] text-gray-400 line-through mb-1">${Number(product.compareAtPrice).toFixed(2)}</span>
              )}
            </div>

            <p className="text-[15px] text-gray-600 leading-[1.7] mb-8">
              {product.description || "Experience the pure essence of nature with our handcrafted botanical products. Sourced ethically and made with care."}
            </p>

            <ProductDetailsClient product={product} variants={variants} />

            <div className="mt-8 pt-8 border-t border-gray-100 space-y-3 text-[13px] text-gray-500">
              <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> In Stock & Ready to Ship</p>
              <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Free shipping on orders over $50</p>
              <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> 100% Natural & Cruelty-Free</p>
            </div>

          </div>
        </div>

        {/* Render Related Products Component */}
        <RelatedProducts products={formattedRelatedProducts} />

      </div>
    </main>
  );
}