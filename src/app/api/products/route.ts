import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { db } from '@/db';
import { products, offerCategories, offerProducts, offers, notifications } from '@/db/schema';
import { isNull, desc, eq, and } from 'drizzle-orm';

// GET all active products (optionally filtered by ?categoryId=)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    const conditions = [isNull(products.deletedAt)];
    if (categoryId) conditions.push(eq(products.categoryId, categoryId));

    const allProducts = await db
      .select()
      .from(products)
      .where(and(...conditions))
      .orderBy(desc(products.createdAt));

    return NextResponse.json(allProducts, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST create new product with full schema fields & multi-image support
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    let sku = formData.get('sku') as string;
    let slug = formData.get('slug') as string;
    const description = formData.get('description') as string;
    const price = formData.get('price') as string;
    const costPrice = formData.get('costPrice') as string;
    const compareAtPrice = formData.get('compareAtPrice') as string;
    const stock = formData.get('stock') ? parseInt(formData.get('stock') as string, 10) : 0;
    const weight = formData.get('weight') as string;
    const categoryId = formData.get('categoryId') as string;
    
    const seoMetaTitle = formData.get('seoMetaTitle') as string;
    const seoMetaDescription = formData.get('seoMetaDescription') as string;
    const isActive = formData.get('isActive') === 'true';
    const isFeatured = formData.get('isFeatured') === 'true';

    const dimensionsString = formData.get('dimensions') as string;
    const metadataString = formData.get('metadata') as string;
    
    const mainImageFile = formData.get('image') as File;
    const galleryFiles = formData.getAll('gallery') as File[];

    if (!name || !price) {
      return NextResponse.json({ error: 'Name and Price are required fields' }, { status: 400 });
    }

    // Auto-generate slug if missing
    if (!slug) {
      slug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    // Auto-generate SKU if missing (e.g. PROD-[SLUG]-RANDOM)
    if (!sku || !sku.trim()) {
      const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
      sku = `SKU-${slug.toUpperCase().slice(0, 10)}-${randomSuffix}`;
    }

    let dimensions = {};
    try {
      if (dimensionsString) dimensions = JSON.parse(dimensionsString);
    } catch (e) {
      dimensions = {};
    }

    let metadata = {};
    try {
      if (metadataString) metadata = JSON.parse(metadataString);
    } catch (e) {
      metadata = {};
    }

    const uploadDir = path.join(process.cwd(), 'public', 'images', 'products', slug);
    await mkdir(uploadDir, { recursive: true });

    // Handle Main Image Upload
    let imageUrl = '';
    if (mainImageFile && mainImageFile.size > 0) {
      const bytes = await mainImageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `main-${Date.now()}-${mainImageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      await writeFile(path.join(uploadDir, filename), buffer);
      imageUrl = `/images/products/${slug}/${filename}`;
    }

    // Handle Gallery Files Upload
    const galleryUrls: string[] = [];
    for (const file of galleryFiles) {
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filename = `gallery-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        await writeFile(path.join(uploadDir, filename), buffer);
        galleryUrls.push(`/images/products/${slug}/${filename}`);
      }
    }

    const [newProduct] = await db
      .insert(products)
      .values({
        name,
        sku,
        slug,
        description: description || null,
        price,
        costPrice: costPrice || null,
        compareAtPrice: compareAtPrice || null,
        stock,
        weight: weight || null,
        dimensions: dimensions as any,
        imageUrl: imageUrl || null,
        galleryUrls,
        categoryId: categoryId && categoryId !== '' ? categoryId : null,
        seoMetaTitle: seoMetaTitle || null,
        seoMetaDescription: seoMetaDescription || null,
        isActive,
        isFeatured,
        metadata: metadata as any,
      })
      .returning();

    // Check if newly created product has stock below 5
    if (stock < 5) {
      await db.insert(notifications).values({
        type: 'low_stock',
        title: 'Low Stock Alert',
        message: `${newProduct.name} was created with only ${stock} item${stock === 1 ? '' : 's'} in stock.`,
        referenceId: newProduct.id,
        referenceType: 'product',
      });
    }

    // Auto-apply category offers
    if (newProduct.categoryId) {
      const activeCategoryOffers = await db
        .select({ 
            offerId: offerCategories.offerId, 
            metadata: offers.metadata 
        })
        .from(offerCategories)
        .innerJoin(offers, eq(offerCategories.offerId, offers.id))
        .where(
          and(
            eq(offerCategories.categoryId, newProduct.categoryId),
            eq(offers.isActive, true)
          )
        );

      if (activeCategoryOffers.length > 0) {
        // Filter out offers where the product is excluded
        const applicableOffers = activeCategoryOffers.filter(o => {
            const metadata = o.metadata as { excludedProductIds?: string[] } | null;
            return !metadata?.excludedProductIds?.includes(newProduct.id);
        });

        if (applicableOffers.length > 0) {
            await db.insert(offerProducts).values(
            applicableOffers.map((o) => ({
                offerId: o.offerId,
                productId: newProduct.id,
            }))
            );
        }
      }
    }

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}