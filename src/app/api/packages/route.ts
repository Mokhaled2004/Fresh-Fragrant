import { NextResponse } from 'next/server';
import { db } from '@/db';
import { packages, packageItems, products, productVariants } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export async function GET() {
  try {
    // Fetch all packages
    const allPackages = await db
      .select()
      .from(packages)
      .orderBy(desc(packages.createdAt));

    // Fetch items for all packages with product and variant info
    const items = await db
      .select({
        id: packageItems.id,
        packageId: packageItems.packageId,
        productId: packageItems.productId,
        variantId: packageItems.variantId,
        productName: products.name,
        productSku: products.sku,
        productPrice: products.price,
        variantSku: productVariants.sku,
        variantMetadata: productVariants.metadata,
        quantity: packageItems.quantity,
        displayOrder: packageItems.displayOrder,
      })
      .from(packageItems)
      .leftJoin(products, eq(packageItems.productId, products.id))
      .leftJoin(productVariants, eq(packageItems.variantId, productVariants.id));

    // Group items by packageId
    const packagesWithItems = allPackages.map((pkg) => ({
      ...pkg,
      items: items.filter((item) => item.packageId === pkg.id),
    }));

    return NextResponse.json(packagesWithItems, { status: 200 });
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const description = formData.get('description') as string;
    const offeredPrice = formData.get('offeredPrice') as string;
    const originalPrice = formData.get('originalPrice') as string;
    const isActive = formData.get('isActive') === 'true';
    const isFeatured = formData.get('isFeatured') === 'true';
    const metadataStr = formData.get('metadata') as string;
    const itemsStr = formData.get('items') as string; // Expects JSON string: [{productId, variantId?, quantity}]
    const imageFile = formData.get('image') as File | null;

    if (!name || !slug || !offeredPrice) {
      return NextResponse.json({ error: 'Name, slug, and offered price are required' }, { status: 400 });
    }

    let imageUrl: string | null = null;
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uniqueSuffix = crypto.randomBytes(6).toString('hex');
      const filename = `${Date.now()}-${uniqueSuffix}-${imageFile.name.replace(/\s+/g, '_')}`;

      const uploadDir = path.join(process.cwd(), 'public', 'images', 'packages');
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, filename), buffer);

      imageUrl = `/images/packages/${filename}`;
    }

    let metadata = {};
    try {
      metadata = metadataStr ? JSON.parse(metadataStr) : {};
    } catch {
      metadata = {};
    }

    let parsedItems: Array<{ productId: string; variantId?: string | null; quantity: number }> = [];
    try {
      parsedItems = itemsStr ? JSON.parse(itemsStr) : [];
    } catch {
      parsedItems = [];
    }

    // Insert package
    const [newPackage] = await db
      .insert(packages)
      .values({
        name,
        slug,
        description,
        offeredPrice,
        originalPrice: originalPrice ? originalPrice : null,
        imageUrl,
        isActive,
        isFeatured,
        metadata,
      })
      .returning();

    // Insert package items with variant support if provided
    if (parsedItems.length > 0) {
      await db.insert(packageItems).values(
        parsedItems.map((item, index) => ({
          packageId: newPackage.id,
          productId: item.productId,
          variantId: item.variantId || null,
          quantity: item.quantity || 1,
          displayOrder: index,
        }))
      );
    }

    return NextResponse.json(newPackage, { status: 201 });
  } catch (error: any) {
    console.error('Error creating package:', error);
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Package with this slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create package' }, { status: 500 });
  }
}