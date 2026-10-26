import { NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, users, products, orderItems, categories } from '@/db/schema';
import { sql, gte, and } from 'drizzle-orm';

export async function GET() {
  try {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // ── Stat cards ──────────────────────────────────────────────────────────

    // Total revenue this month
    const [revenueThis] = await db
      .select({ total: sql<string>`coalesce(sum(total), 0)` })
      .from(orders)
      .where(gte(orders.createdAt, startOfThisMonth));

    const [revenueLast] = await db
      .select({ total: sql<string>`coalesce(sum(total), 0)` })
      .from(orders)
      .where(and(gte(orders.createdAt, startOfLastMonth), sql`${orders.createdAt} <= ${endOfLastMonth}`));

    // Total orders
    const [ordersThis] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(gte(orders.createdAt, startOfThisMonth));

    const [ordersLast] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(and(gte(orders.createdAt, startOfLastMonth), sql`${orders.createdAt} <= ${endOfLastMonth}`));

    // Total users
    const [usersThis] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(gte(users.createdAt, startOfThisMonth));

    const [usersLast] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(and(gte(users.createdAt, startOfLastMonth), sql`${users.createdAt} <= ${endOfLastMonth}`));

    // Total sold products (sum of quantity in order items this month)
    const [soldThis] = await db
      .select({ count: sql<number>`coalesce(sum(${orderItems.quantity}), 0)` })
      .from(orderItems)
      .innerJoin(orders, sql`${orderItems.orderId} = ${orders.id}`)
      .where(gte(orders.createdAt, startOfThisMonth));

    const [soldLast] = await db
      .select({ count: sql<number>`coalesce(sum(${orderItems.quantity}), 0)` })
      .from(orderItems)
      .innerJoin(orders, sql`${orderItems.orderId} = ${orders.id}`)
      .where(and(gte(orders.createdAt, startOfLastMonth), sql`${orders.createdAt} <= ${endOfLastMonth}`));

    // ── Bar chart: monthly revenue last 7 months ────────────────────────────
    const sevenMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    const monthlyRevenue = await db
      .select({
        month: sql<string>`to_char(${orders.createdAt}, 'Mon')`,
        monthNum: sql<number>`extract(month from ${orders.createdAt})::int`,
        year: sql<number>`extract(year from ${orders.createdAt})::int`,
        revenue: sql<string>`coalesce(sum(${orders.total}), 0)`,
        orderCount: sql<number>`count(*)`,
      })
      .from(orders)
      .where(gte(orders.createdAt, sevenMonthsAgo))
      .groupBy(
        sql`to_char(${orders.createdAt}, 'Mon')`,
        sql`extract(month from ${orders.createdAt})`,
        sql`extract(year from ${orders.createdAt})`,
      )
      .orderBy(sql`extract(year from ${orders.createdAt}), extract(month from ${orders.createdAt})`);

    // ── Donut: product sales by category ────────────────────────────────────
    const categorySales = await db
      .select({
        categoryName: categories.name,
        count: sql<number>`coalesce(sum(${orderItems.quantity}), 0)`,
      })
      .from(orderItems)
      .innerJoin(products, sql`${orderItems.productId} = ${products.id}`)
      .innerJoin(categories, sql`${products.categoryId} = ${categories.id}`)
      .groupBy(categories.name)
      .orderBy(sql`sum(${orderItems.quantity}) desc`)
      .limit(6);

    // ── User growth last 6 months ────────────────────────────────────────────
    const userGrowth = await db
      .select({
        month: sql<string>`to_char(${users.createdAt}, 'Mon')`,
        monthNum: sql<number>`extract(month from ${users.createdAt})::int`,
        count: sql<number>`count(*)`,
      })
      .from(users)
      .where(gte(users.createdAt, sevenMonthsAgo))
      .groupBy(
        sql`to_char(${users.createdAt}, 'Mon')`,
        sql`extract(month from ${users.createdAt})`,
      )
      .orderBy(sql`extract(month from ${users.createdAt})`);

    // ── Helpers ──────────────────────────────────────────────────────────────
    const pct = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100 * 10) / 10;
    };

    const revenueThisN = parseFloat(revenueThis.total);
    const revenueLastN = parseFloat(revenueLast.total);
    const ordersThisN = Number(ordersThis.count);
    const ordersLastN = Number(ordersLast.count);
    const usersThisN = Number(usersThis.count);
    const usersLastN = Number(usersLast.count);
    const soldThisN = Number(soldThis.count);
    const soldLastN = Number(soldLast.count);

    return NextResponse.json({
      stats: {
        revenue: { value: revenueThisN, pct: pct(revenueThisN, revenueLastN) },
        orders:  { value: ordersThisN,  pct: pct(ordersThisN,  ordersLastN) },
        users:   { value: usersThisN,   pct: pct(usersThisN,   usersLastN) },
        sold:    { value: soldThisN,    pct: pct(soldThisN,    soldLastN) },
      },
      monthlyRevenue,
      categorySales,
      userGrowth,
    });
  } catch (err) {
    console.error('[Dashboard API]', err);
    return NextResponse.json({ error: 'Failed to load dashboard data' }, { status: 500 });
  }
}
