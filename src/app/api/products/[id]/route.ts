import { NextRequest, NextResponse } from 'next/server';
import { unlink, rm, mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { db } from '@/db';
import { products, productVariants, packageItems, packages, notifications, adminSettings } from '@/db/schema';
import { eq, and, isNull, inArray } from 'drizzle-orm';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.id, id), isNull(products.deletedAt)));

    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const formData = await request.formData();

    const [existing] = await db.select().from(products).where(eq(products.id, id));
    if (!existing) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const name = formData.get('name') as string;
    const sku = formData.get('sku') as string;
    const slug = formData.get('slug') as string;
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
    const removedGalleryUrls = JSON.parse((formData.get('removedGalleryUrls') as string) || '[]');

    const mainImageFile = formData.get('image') as File;
    const newGalleryFiles = formData.getAll('gallery') as File[];

    let dimensions = existing.dimensions;
    try { if (dimensionsString) dimensions = JSON.parse(dimensionsString); } catch (e) {}

    let metadata = existing.metadata;
    try { if (metadataString) metadata = JSON.parse(metadataString); } catch (e) {}

    const targetSlug = slug || existing.slug;
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'products', targetSlug);
    await mkdir(uploadDir, { recursive: true });

    let imageUrl = existing.imageUrl;
    if (mainImageFile && mainImageFile.size > 0) {
      if (existing.imageUrl) {
        try { await unlink(path.join(process.cwd(), 'public', existing.imageUrl)); } catch (err) {}
      }
      const bytes = await mainImageFile.arrayBuffer();
      const filename = `main-${Date.now()}-${mainImageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      await writeFile(path.join(uploadDir, filename), Buffer.from(bytes));
      imageUrl = `/images/products/${targetSlug}/${filename}`;
    }

    let updatedGallery = [...(existing.galleryUrls || [])];
    for (const url of removedGalleryUrls) {
      try { await unlink(path.join(process.cwd(), 'public', url)); } catch (err) {}
      updatedGallery = updatedGallery.filter(u => u !== url);
    }
    for (const file of newGalleryFiles) {
      if (file && file.size > 0) {
        const lowerName = file.name.toLowerCase();
        if (lowerName.endsWith('.heic') || lowerName.endsWith('.heif')) {
          return NextResponse.json(
            { error: 'HEIC/HEIF images are not supported. Please convert to JPG or PNG first.' },
            { status: 400 }
          );
        }
        const bytes = await file.arrayBuffer();
        const filename = `gallery-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        await writeFile(path.join(uploadDir, filename), Buffer.from(bytes));
        updatedGallery.push(`/images/products/${targetSlug}/${filename}`);
      }
    }

    const [updatedProduct] = await db
      .update(products)
      .set({
        name, sku, slug: targetSlug, description, price,
        costPrice: costPrice || null, compareAtPrice: compareAtPrice || null,
        stock, weight: weight || null, dimensions: dimensions as any,
        imageUrl, galleryUrls: updatedGallery, categoryId: categoryId || null,
        seoMetaTitle, seoMetaDescription, isActive, isFeatured,
        metadata: metadata as any, updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();

    // Fire a low-stock notification on every save where stock is below threshold
    const [appSettings] = await db.select({ lowStockThreshold: adminSettings.lowStockThreshold, notifyOnLowStock: adminSettings.notifyOnLowStock }).from(adminSettings).limit(1);
    const threshold = appSettings?.lowStockThreshold ?? 5;
    const notifyLowStock = appSettings?.notifyOnLowStock ?? true;

    if (notifyLowStock && stock < threshold) {
      await db.insert(notifications).values({
        type: 'low_stock',
        title: 'Low Stock Alert',
        message: `${updatedProduct.name} is down to ${stock} item${stock === 1 ? '' : 's'}.`,
        referenceId: updatedProduct.id,
        referenceType: 'product',
      });
    }

    return NextResponse.json({ success: true, product: updatedProduct }, { status: 200 });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// === DELETE PRODUCT ===
// - Checks if product is used in any packages
// - If yes and no `force` → returns 409 with package list
// - If force=true → disables those packages + soft deletes the product
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const force = url.searchParams.get('force') === 'true';

    const [product] = await db.select().from(products).where(eq(products.id, id));
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    // Check if product is used in packages
    const packageRefs = await db
      .select({
        packageId: packages.id,
        packageName: packages.name,
        packageSlug: packages.slug,
      })
      .from(packageItems)
      .innerJoin(packages, eq(packageItems.packageId, packages.id))
      .where(eq(packageItems.productId, id));

    // If used in packages and NOT forced → return 409 with the list
    if (packageRefs.length > 0 && !force) {
      return NextResponse.json(
        {
          error: 'PRODUCT_IN_PACKAGES',
          message: `This product is used in ${packageRefs.length} package${packageRefs.length > 1 ? 's' : ''}.`,
          packages: packageRefs,
        },
        { status: 409 }
      );
    }

    // If forced (or not used), proceed with soft delete
    const disabledPackageIds = packageRefs.map((p) => p.packageId);

    if (disabledPackageIds.length > 0) {
      await db
        .update(packages)
        .set({ isActive: false, updatedAt: new Date() })
        .where(inArray(packages.id, disabledPackageIds));
    }

    // Soft delete product + its variants
    await db
      .update(productVariants)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(productVariants.productId, id));

    await db
      .update(products)
      .set({
        deletedAt: new Date(),
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id));

    // Clean up physical files
    if (product.slug) {
      const folderPath = path.join(process.cwd(), 'public', 'images', 'products', product.slug);
      try {
        await rm(folderPath, { recursive: true, force: true });
      } catch (err) {}
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Product deleted successfully',
        disabledPackages: packageRefs,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}