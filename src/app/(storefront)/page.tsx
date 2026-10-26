import { and, asc, desc, eq, isNotNull, isNull, or, lte, gt } from 'drizzle-orm';
import { db } from '@/db';
import { offers, products } from '@/db/schema';
import Hero from '@/components/landing/Hero';
import ProductCategories from '@/components/landing/ProductCategories';
import SkinAnalysisBanner from '@/components/landing/SkinAnalysisBanner';
import FeaturedProducts from '@/components/landing/FeaturedProducts';
import NewIn from '@/components/landing/NewIn';
import SpecialOffersBanner from '@/components/landing/SpecialOffersBanner';
import OurBrand from '@/components/landing/OurBrand';
import BlogSection from '@/components/landing/BlogSection';
import ContactSection from '@/components/landing/ContactSection';
import StoreFooter from '@/components/landing/StoreFooter';
import ScrollReveal from '@/components/animation/ScrollReveal';
import { HOME_PRODUCT_LIMIT } from '@/components/landing/home-config';
import FeaturesBar from '@/components/landing/FeaturesBar';
export const dynamic = 'force-dynamic';

export default async function StorefrontHomePage() {
  const now = new Date();
  const [featuredProducts] = await Promise.all([
    db.select({
      id: products.id,
      name: products.name,
      sku: products.sku,
      slug: products.slug,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      imageUrl: products.imageUrl,
      isFeatured: products.isFeatured,
    }).from(products)
      .where(and(isNull(products.deletedAt), eq(products.isActive, true)))
      .orderBy(desc(products.isFeatured), desc(products.createdAt))
      .limit(HOME_PRODUCT_LIMIT),
  ]);

  return (
    <>
      <Hero />
      <main>
        <ScrollReveal>
          <ProductCategories />
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <SkinAnalysisBanner />
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <FeaturedProducts products={featuredProducts} />
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <NewIn />
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <SpecialOffersBanner />
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <OurBrand />
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <BlogSection />
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <ContactSection />
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <FeaturesBar />
        </ScrollReveal>
        
      </main>
      <StoreFooter />
    </>
  );
}
