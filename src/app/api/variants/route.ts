import { NextResponse } from 'next/server';
import { db } from '@/db';
import { productVariants, products } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export async function GET() {
  try {
    const variants = await db
      .select({
        id: productVariants.id,
        productId: productVariants.productId,
        productName: products.name,
        productBasePrice: products.price, // Added base price for reference
        sku: productVariants.sku,
        price: productVariants.price,
        stock: productVariants.stock,
        imageUrl: productVariants.imageUrl,
        metadata: productVariants.metadata,
        isActive: productVariants.isActive,
        createdAt: productVariants.createdAt,
        updatedAt: productVariants.updatedAt,
      })
      .from(productVariants)
      .leftJoin(products, eq(productVariants.productId, products.id))
      .orderBy(desc(productVariants.createdAt));

    return NextResponse.json(variants, { status: 200 });
  } catch (error) {
    console.error('Error fetching variants:', error);
    return NextResponse.json({ error: 'Failed to fetch variants' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const productId = formData.get('productId') as string;
    const sku = formData.get('sku') as string;
    const price = formData.get('price') as string;
    const stock = formData.get('stock') as string;
    const isActive = formData.get('isActive') === 'true';
    const metadataStr = formData.get('metadata') as string;
    const imageFile = formData.get('image') as File | null;

    if (!productId || !sku) {
      return NextResponse.json({ error: 'Product ID and SKU are required' }, { status: 400 });
    }

    // If variant price is empty, fetch parent product price to inherit
    let finalPrice = price && price.trim() !== '' ? price : null;
    if (!finalPrice) {
      const [parentProduct] = await db
        .select({ price: products.price })
        .from(products)
        .where(eq(products.id, productId));
      
      if (parentProduct) {
        finalPrice = parentProduct.price;
      }
    }

    let imageUrl: string | null = null;
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uniqueSuffix = crypto.randomBytes(6).toString('hex');
      const filename = `${Date.now()}-${uniqueSuffix}-${imageFile.name.replace(/\s+/g, '_')}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'variants');
      
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, filename), buffer);
      imageUrl = `/uploads/variants/${filename}`;
    }

    let metadata = {};
    try {
      metadata = metadataStr ? JSON.parse(metadataStr) : {};
    } catch {
      metadata = {};
    }

    const [newVariant] = await db
      .insert(productVariants)
      .values({
        productId,
        sku,
        price: finalPrice,
        stock: stock ? parseInt(stock, 10) : 0,
        imageUrl,
        metadata,
        isActive,
      })
      .returning();

    return NextResponse.json(newVariant, { status: 201 });
  } catch (error: any) {
    console.error('Error creating variant:', error);
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Variant with this SKU already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create variant' }, { status: 500 });
  }
}