import { NextResponse } from 'next/server';
import { db } from '@/db';
import { productVariants } from '@/db/schema';
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
    const productId = formData.get('productId') as string;
    const sku = formData.get('sku') as string;
    const price = formData.get('price') as string;
    const stock = formData.get('stock') as string;
    const isActive = formData.get('isActive') === 'true';
    const metadataStr = formData.get('metadata') as string;
    const imageFile = formData.get('image') as File | null;

    // Fetch existing variant to check old image
    const [existing] = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.id, id));

    if (!existing) {
      return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
    }

    let imageUrl = existing.imageUrl;

    // Handle new image upload & delete old file if replaced
    if (imageFile && imageFile.size > 0) {
      if (existing.imageUrl) {
        try {
          const oldPath = path.join(process.cwd(), 'public', existing.imageUrl);
          await unlink(oldPath);
        } catch (err) {
          console.error('Failed to delete old variant image:', err);
        }
      }

      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uniqueSuffix = crypto.randomBytes(6).toString('hex');
      const filename = `${Date.now()}-${uniqueSuffix}-${imageFile.name.replace(/\s+/g, '_')}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'variants');

      // Ensure directory exists
      await mkdir(uploadDir, { recursive: true });

      await writeFile(path.join(uploadDir, filename), buffer);
      imageUrl = `/uploads/variants/${filename}`;
    }

    let metadata: Record<string, any> = {};
    try {
      metadata = metadataStr ? JSON.parse(metadataStr) : {};
    } catch {
      metadata = existing.metadata || {};
    }

    const [updatedVariant] = await db
      .update(productVariants)
      .set({
        productId,
        sku,
        price: price !== undefined && price !== '' ? price : null,
        stock: stock !== undefined ? parseInt(stock, 10) : undefined,
        imageUrl,
        metadata,
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(productVariants.id, id))
      .returning();

    return NextResponse.json(updatedVariant, { status: 200 });
  } catch (error) {
    console.error('Error updating variant:', error);
    return NextResponse.json({ error: 'Failed to update variant' }, { status: 500 });
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
      .from(productVariants)
      .where(eq(productVariants.id, id));

    if (!existing) {
      return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
    }

    // Delete image file from disk if it exists
    if (existing.imageUrl) {
      try {
        const filePath = path.join(process.cwd(), 'public', existing.imageUrl);
        await unlink(filePath);
      } catch (err) {
        console.error('Failed to delete variant image file:', err);
      }
    }

    await db.delete(productVariants).where(eq(productVariants.id, id));

    return NextResponse.json({ message: 'Variant deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting variant:', error);
    return NextResponse.json({ error: 'Failed to delete variant' }, { status: 500 });
  }
}