import { NextResponse } from 'next/server';
import { db } from '@/db';
import { packages, packageItems } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { writeFile, unlink, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const description = formData.get('description') as string;
    const offeredPrice = formData.get('offeredPrice') as string;
    const originalPrice = formData.get('originalPrice') as string;
    const isActive = formData.get('isActive') === 'true';
    const isFeatured = formData.get('isFeatured') === 'true';
    const metadataStr = formData.get('metadata') as string;
    const itemsStr = formData.get('items') as string;
    const imageFile = formData.get('image') as File | null;

    const [existing] = await db
      .select()
      .from(packages)
      .where(eq(packages.id, id));

    if (!existing) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    let imageUrl = existing.imageUrl;

    if (imageFile && imageFile.size > 0) {
      if (existing.imageUrl) {
        try {
          const oldPath = path.join(process.cwd(), 'public', existing.imageUrl);
          await unlink(oldPath);
        } catch (err) {
          // ignore — old file may not exist
        }
      }

      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uniqueSuffix = crypto.randomBytes(6).toString('hex');
      const filename = `${Date.now()}-${uniqueSuffix}-${imageFile.name.replace(/\s+/g, '_')}`;
      const uploadDir = path.join(process.cwd(), 'public', 'images', 'packages');

      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, filename), buffer);
      imageUrl = `/images/packages/${filename}`;
    }

    let metadata: Record<string, any> = {};
    try {
      metadata = metadataStr ? JSON.parse(metadataStr) : {};
    } catch {
      metadata = existing.metadata || {};
    }

    let parsedItems: Array<{ productId: string; quantity: number }> = [];
    try {
      parsedItems = itemsStr ? JSON.parse(itemsStr) : [];
    } catch {
      parsedItems = [];
    }

    // Update package info
    const [updatedPackage] = await db
      .update(packages)
      .set({
        name,
        slug,
        description,
        offeredPrice,
        originalPrice: originalPrice ? originalPrice : null,
        imageUrl,
        isActive,
        isFeatured,
        metadata,
        updatedAt: new Date(),
      })
      .where(eq(packages.id, id))
      .returning();

    // Re-sync package items (delete old ones, insert new ones)
    await db.delete(packageItems).where(eq(packageItems.packageId, id));

    if (parsedItems.length > 0) {
      await db.insert(packageItems).values(
        parsedItems.map((item, index) => ({
          packageId: id,
          productId: item.productId,
          quantity: item.quantity || 1,
          displayOrder: index,
        }))
      );
    }

    return NextResponse.json(updatedPackage, { status: 200 });
  } catch (error) {
    console.error('Error updating package:', error);
    return NextResponse.json({ error: 'Failed to update package' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [existing] = await db
      .select()
      .from(packages)
      .where(eq(packages.id, id));

    if (!existing) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    if (existing.imageUrl) {
      try {
        const filePath = path.join(process.cwd(), 'public', existing.imageUrl);
        await unlink(filePath);
      } catch (err) {
        console.error('Failed to delete package image file:', err);
      }
    }

    await db.delete(packages).where(eq(packages.id, id));

    return NextResponse.json({ message: 'Package deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting package:', error);
    return NextResponse.json({ error: 'Failed to delete package' }, { status: 500 });
  }
}