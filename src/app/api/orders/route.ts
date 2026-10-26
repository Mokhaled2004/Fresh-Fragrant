import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems, products, notifications } from '@/db/schema';
import { desc, eq, sql } from 'drizzle-orm';

export async function GET() {
  try {
    const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
    const result = await Promise.all(
      allOrders.map(async (order) => {
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
        return { ...order, items };
      })
    );
    return NextResponse.json({ orders: result });
  } catch (error) {
    console.error('GET /api/orders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId, shippingName, shippingPhone, shippingEmail,
      shippingAddress, shippingCity, shippingCountry, shippingPostalCode,
      notes, paymentMethod, subtotal, shippingCost, discount, total, currency,
      items
    } = body;

    // Generate order number FF-YYYY-XXXX
    const year = new Date().getFullYear();
    const countResult = await db.select({ count: sql<number>`count(*)::int` }).from(orders);
    const count = countResult[0]?.count ?? 0;
    const orderNumber = `FF-${year}-${String(count + 1).padStart(4, '0')}`;

    // Insert order
    const [newOrder] = await db.insert(orders).values({
      orderNumber,
      userId: userId || null,
      shippingName,
      shippingPhone,
      shippingEmail,
      shippingAddress,
      shippingCity,
      shippingCountry,
      shippingPostalCode,
      notes,
      paymentMethod,
      subtotal: String(subtotal),
      shippingCost: String(shippingCost ?? 0),
      discount: String(discount ?? 0),
      total: String(total),
      currency: currency || 'EGP',
      status: 'pending',
      paymentStatus: 'pending',
    }).returning();

    // Insert order items
    if (items && items.length > 0) {
      await db.insert(orderItems).values(
        items.map((item: any) => ({
          orderId: newOrder.id,
          productId: item.productId || null,
          variantId: item.variantId || null,
          productName: item.productName,
          productImage: item.productImage || null,
          unitPrice: String(item.unitPrice),
          quantity: item.quantity,
          lineTotal: String(item.lineTotal),
        }))
      );
    }

    // Create new_order notification
    await db.insert(notifications).values({
      type: 'new_order',
      title: `New Order ${orderNumber}`,
      message: `${shippingName} placed an order for ${currency} ${Number(total).toFixed(2)}`,
      referenceId: newOrder.id,
      referenceType: 'order',
    });

    // Decrement stock and check for low stock
    if (items && items.length > 0) {
      for (const item of items) {
        if (!item.productId) continue;
        await db
          .update(products)
          .set({ stock: sql`${products.stock} - ${item.quantity}` })
          .where(eq(products.id, item.productId));

        const [updatedProduct] = await db
          .select({ id: products.id, stock: products.stock, name: products.name })
          .from(products)
          .where(eq(products.id, item.productId))
          .limit(1);

        if (updatedProduct && Number(updatedProduct.stock) < 5) {
          await db.insert(notifications).values({
            type: 'low_stock',
            title: 'Low Stock Alert',
            message: `${updatedProduct.name} is down to ${updatedProduct.stock} item${Number(updatedProduct.stock) === 1 ? '' : 's'}.`,
            referenceId: updatedProduct.id,
            referenceType: 'product',
          });
        }
      }
    }

    return NextResponse.json({ order: newOrder }, { status: 201 });
  } catch (error) {
    console.error('POST /api/orders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
