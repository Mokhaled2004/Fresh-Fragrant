import { NextResponse } from 'next/server';
import { db } from '@/db';
import { offers, offerProducts, offerCategories, offerVariants, offerPackages } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

const LINK_TABLES = { productIds: offerProducts, categoryIds: offerCategories, variantIds: offerVariants, packageIds: offerPackages } as const;
type LinkKey = keyof typeof LINK_TABLES;

function normalize(body: any) {
  const type = String(body.type || '');
  const supported = ['percentage', 'fixed', 'fixed_amount', 'buy_x_get_y', 'coupon'];
  if (!body.name?.trim()) throw new Error('Offer name is required.');
  if (!supported.includes(type)) throw new Error('Choose a supported offer type.');
  const value = body.value === '' || body.value == null ? null : Number(body.value);
  if (type !== 'buy_x_get_y' && (!Number.isFinite(value) || value! <= 0)) throw new Error('Enter a discount greater than zero.');
  if (['percentage'].includes(type) && value! > 100) throw new Error('Percentage discounts cannot exceed 100%.');
  const startAt = body.startAt ? new Date(body.startAt) : null;
  const endAt = body.endAt ? new Date(body.endAt) : null;
  if (startAt && Number.isNaN(startAt.getTime())) throw new Error('Start date is invalid.');
  if (endAt && Number.isNaN(endAt.getTime())) throw new Error('Deadline is invalid.');
  if (startAt && endAt && startAt >= endAt) throw new Error('Deadline must be after the start date.');
  const metadata = { ...(body.metadata || {}) };
  if (type === 'coupon') {
    metadata.discountType = body.couponDiscountType === 'fixed' ? 'fixed' : 'percentage';
    if (metadata.discountType === 'percentage' && value! > 100) throw new Error('Percentage coupons cannot exceed 100%.');
  }
  if (type === 'buy_x_get_y') {
    const buyQuantity = Number(body.buyQuantity ?? metadata.buyQuantity);
    const getQuantity = Number(body.getQuantity ?? metadata.getQuantity);
    if (!Number.isInteger(buyQuantity) || buyQuantity < 1 || !Number.isInteger(getQuantity) || getQuantity < 1) throw new Error('Buy X Get Y quantities must be whole numbers greater than zero.');
    metadata.buyQuantity = buyQuantity;
    metadata.getQuantity = getQuantity;
    metadata.getDiscountPercent = Number(body.getDiscountPercent ?? metadata.getDiscountPercent ?? 100);
    if (metadata.getDiscountPercent < 0 || metadata.getDiscountPercent > 100) throw new Error('Get discount must be between 0 and 100%.');
  }
  const couponCode = type === 'coupon' ? String(body.couponCode || '').trim().toUpperCase() : null;
  if (type === 'coupon' && !couponCode) throw new Error('Coupon code is required.');
  return {
    name: body.name.trim(), description: body.description || null, type, value: value === null ? null : String(value), couponCode,
    minimumOrderAmount: body.minimumOrderAmount ? String(body.minimumOrderAmount) : null,
    maximumDiscountAmount: body.maximumDiscountAmount ? String(body.maximumDiscountAmount) : null,
    startAt, endAt, isActive: body.isActive ?? true, metadata,
  };
}

async function saveLinks(offerId: string, body: any) {
  for (const key of Object.keys(LINK_TABLES) as LinkKey[]) {
    const table = LINK_TABLES[key];
    await db.delete(table).where(eq(table.offerId, offerId));
    const ids: string[] = Array.isArray(body[key]) ? [...new Set(body[key].filter((id: unknown) => typeof id === 'string' && id))] : [];
    if (ids.length) await db.insert(table).values(ids.map((id) => ({ offerId, [key.slice(0, -1) + 'Id']: id } as any)));
  }
}

export async function GET() {
  try {
    const allOffers = await db.query.offers.findMany({ orderBy: [desc(offers.createdAt)], with: {
      offerProducts: { with: { product: true } }, offerCategories: { with: { category: true } },
      offerVariants: { with: { variant: true } }, offerPackages: { with: { package: true } },
    } });
    return NextResponse.json(allOffers);
  } catch (error) {
    console.error('Failed to fetch offers:', error);
    return NextResponse.json({ error: 'Failed to fetch offers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const values = normalize(body);
    const [offer] = await db.insert(offers).values(values).returning();
    await saveLinks(offer.id, body);
    return NextResponse.json({ success: true, offer }, { status: 201 });
  } catch (error: any) {
    const code = error?.code;
    const message = error instanceof Error ? error.message : 'Failed to create offer';
    console.error('Offer creation failed:', error);
    const status = code === '23505' ? 409 : code ? 500 : 400;
    return NextResponse.json({ error: code ? 'Could not save this offer. Check that its code is unique and its selected items still exist.' : message }, { status });
  }
}
