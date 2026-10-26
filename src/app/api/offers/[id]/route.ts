import { NextResponse } from 'next/server';
import { db } from '@/db';
import { offers, offerProducts, offerCategories, offerVariants, offerPackages } from '@/db/schema';
import { eq } from 'drizzle-orm';

const tables = [offerProducts, offerCategories, offerVariants, offerPackages] as const;
async function normalize(body: any) {
  const type = String(body.type || '');
  if (!body.name?.trim()) throw new Error('Offer name is required.');
  if (!['percentage', 'fixed', 'fixed_amount', 'buy_x_get_y', 'coupon'].includes(type)) throw new Error('Choose a supported offer type.');
  const value = body.value == null || body.value === '' ? null : Number(body.value);
  if (type !== 'buy_x_get_y' && (!Number.isFinite(value) || value! <= 0)) throw new Error('Enter a discount greater than zero.');
  if (type === 'percentage' && value! > 100) throw new Error('Percentage discounts cannot exceed 100%.');
  const startAt = body.startAt ? new Date(body.startAt) : null;
  const endAt = body.endAt ? new Date(body.endAt) : null;
  if (startAt && Number.isNaN(startAt.getTime()) || endAt && Number.isNaN(endAt.getTime())) throw new Error('Offer dates are invalid.');
  if (startAt && endAt && startAt >= endAt) throw new Error('Deadline must be after the start date.');
  const metadata = { ...(body.metadata || {}) };
  if (type === 'coupon') {
    metadata.discountType = body.couponDiscountType === 'fixed' ? 'fixed' : 'percentage';
    if (metadata.discountType === 'percentage' && value! > 100) throw new Error('Percentage coupons cannot exceed 100%.');
  }
  if (type === 'buy_x_get_y') {
    metadata.buyQuantity = Number(body.buyQuantity ?? metadata.buyQuantity);
    metadata.getQuantity = Number(body.getQuantity ?? metadata.getQuantity);
    metadata.getDiscountPercent = Number(body.getDiscountPercent ?? metadata.getDiscountPercent ?? 100);
    if (!Number.isInteger(metadata.buyQuantity) || metadata.buyQuantity < 1 || !Number.isInteger(metadata.getQuantity) || metadata.getQuantity < 1 || metadata.getDiscountPercent < 0 || metadata.getDiscountPercent > 100) throw new Error('Enter valid Buy X Get Y quantities and discount.');
  }
  const couponCode = type === 'coupon' ? String(body.couponCode || '').trim().toUpperCase() : null;
  if (type === 'coupon' && !couponCode) throw new Error('Coupon code is required.');
  return { name: body.name.trim(), description: body.description || null, type, value: value == null ? null : String(value), couponCode, minimumOrderAmount: body.minimumOrderAmount ? String(body.minimumOrderAmount) : null, maximumDiscountAmount: body.maximumDiscountAmount ? String(body.maximumDiscountAmount) : null, startAt, endAt, isActive: body.isActive ?? true, metadata, updatedAt: new Date() };
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const values = await normalize(body);
    const [updated] = await db.update(offers).set(values).where(eq(offers.id, id)).returning();
    if (!updated) return NextResponse.json({ error: 'Offer not found.' }, { status: 404 });
    const idGroups = [body.productIds, body.categoryIds, body.variantIds, body.packageIds];
    for (let i = 0; i < tables.length; i++) {
      await db.delete(tables[i]).where(eq(tables[i].offerId, id));
      const key = ['productId', 'categoryId', 'variantId', 'packageId'][i];
      const ids = (Array.isArray(idGroups[i]) ? [...new Set(idGroups[i].filter((v: unknown) => typeof v === 'string' && v))] : []) as string[];
      if (ids.length) await db.insert(tables[i]).values(ids.map((itemId) => ({ offerId: id, [key]: itemId } as any)));
    }
    return NextResponse.json({ success: true, offer: updated });
  } catch (error: any) {
    const message = error?.message || 'Failed to update offer';
    return NextResponse.json({ error: message }, { status: message.includes('duplicate key') ? 409 : 400 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const [deleted] = await db.delete(offers).where(eq(offers.id, id)).returning({ id: offers.id });
    return deleted ? NextResponse.json({ success: true }) : NextResponse.json({ error: 'Offer not found.' }, { status: 404 });
  } catch (error) {
    console.error('Failed to delete offer:', error);
    return NextResponse.json({ error: 'Failed to delete offer' }, { status: 500 });
  }
}
