import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { categories, products, productVariants } from '@/db/schema';
import { eq, isNull } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const [updated] = await db
      .update(categories)
      .set({
        name: body.name,
        slug: body.slug,
        description: body.description,
        parentCategoryId: body.parentCategoryId || null,
        displayOrder: body.displayOrder !== undefined ? Number(body.displayOrder) : 0,
        isActive: body.isActive,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, category: updated }, { status: 200 });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    // mode: 'delete-products' | 'unassign-products' (default: 'unassign-products')
    const mode = url.searchParams.get('mode') ?? 'unassign-products';

    const [cat] = await db.select().from(categories).where(eq(categories.id, id));
    if (!cat) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Get all products under this category
    const affectedProducts = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.categoryId, id));

    const affectedProductIds = affectedProducts.map((p) => p.id);

    if (mode === 'delete-products' && affectedProductIds.length > 0) {
      // Soft-delete variants first
      for (const pid of affectedProductIds) {
        await db
          .update(productVariants)
          .set({ isActive: false, updatedAt: new Date() })
          .where(eq(productVariants.productId, pid));
      }
      // Soft-delete products
      for (const pid of affectedProductIds) {
        await db
          .update(products)
          .set({ deletedAt: new Date(), isActive: false, updatedAt: new Date() })
          .where(eq(products.id, pid));
      }
    } else if (mode === 'unassign-products' && affectedProductIds.length > 0) {
      // Unassign products from this category
      for (const pid of affectedProductIds) {
        await db
          .update(products)
          .set({ categoryId: null, updatedAt: new Date() })
          .where(eq(products.id, pid));
      }
    }

    // Soft-delete the category
    const [updated] = await db
      .update(categories)
      .set({ deletedAt: new Date(), isActive: false })
      .where(eq(categories.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Category deleted successfully',
        affectedProducts: affectedProductIds.length,
        mode,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}