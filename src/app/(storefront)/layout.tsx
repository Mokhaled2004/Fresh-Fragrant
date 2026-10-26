import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';
import MainHeader from '@/components/MainHeader';
import { and, asc, eq, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { categories } from '@/db/schema';
import CartProvider from '@/components/cart/CartProvider';
import { Suspense } from 'react';

async function StorefrontHeader() {
  const [cookieStore, menuCategories] = await Promise.all([
    cookies(),
    db.select({ id: categories.id, name: categories.name, slug: categories.slug })
      .from(categories).where(and(eq(categories.isActive, true), isNull(categories.deletedAt)))
      .orderBy(asc(categories.displayOrder), asc(categories.name)),
  ]);
  const token = cookieStore.get('auth_token')?.value;
  const user = token ? verifyToken(token) : null;
  return <MainHeader />;
}

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-white text-foreground flex flex-col relative">
        
        {/* 
          Removed the border completely. 
          The fallback is now just a clean, invisible 80px block.
        */}
        <Suspense fallback={<div aria-hidden="true" className="h-20 w-full bg-white" />}>
          <StorefrontHeader />
        </Suspense>

        <div className="flex-grow">{children}</div>
      </div>
    </CartProvider>
  );
}