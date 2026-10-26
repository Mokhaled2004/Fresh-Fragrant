# Implementation Plan: Orders + Notifications System

## Exploration Notes

The project runs **Next.js 16.3.3** (not 15, but the same async `params` convention applies).
Build: `npm run build` / `next build`. No test framework installed — verification uses TypeScript compilation
(`npx tsc --noEmit`) and a dev-server smoke test (`npm run dev`).

Dynamic route handlers follow the exact same `{ params }: { params: Promise<{ id: string }> }` convention
confirmed in `node_modules/next/dist/docs/…/dynamic-routes.md` and used in existing routes such as
`src/app/api/categories/[id]/route.ts`.

DB pattern: Drizzle ORM, import `db` from `@/db`, import tables from `@/db/schema`, use `eq`, `desc`, `and`,
`isNull` from `drizzle-orm`. All numeric DB values are returned as strings from Drizzle (e.g. `"94.50"`).

Cart item shape (from `CartProvider.tsx`): `{ productId, variantId?, variantLabel?, name, sku, price: number, imageUrl: string|null, quantity }` — type is `CartLine`.

---

## Item 1 — Add `notifications` table to schema and push migration

Add the `notifications` pgTable definition to `src/db/schema.ts` immediately after the `orderItems` table block
(before the landing-page tables). Then add `Notification` / `NewNotification` type exports in the TYPE EXPORTS
block at the bottom of the same file.

**Schema definition:**
```ts
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: varchar("type", { length: 50 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    referenceId: uuid("reference_id"),
    referenceType: varchar("reference_type", { length: 50 }),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("notifications_type_idx").on(table.type),
    index("notifications_is_read_idx").on(table.isRead),
    index("notifications_created_at_idx").on(table.createdAt),
  ],
);
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
```

**Files:**
- `src/db/schema.ts`

**After editing schema, run the push:**
```
npx drizzle-kit push
```

**Verify:** `npx drizzle-kit push` completes without error and reports the `notifications` table was created.
Then run `npx tsc --noEmit` and confirm zero TypeScript errors.

---

## Item 2 — Create `GET /api/orders` and `POST /api/orders`

Create `src/app/api/orders/route.ts`. This file handles both listing all orders and creating a new order from
checkout. It follows the exact same structure as the existing `src/app/api/products/route.ts` and
`src/app/api/categories/route.ts`.

**GET** — query all orders joined with their items, ordered by `createdAt desc`. Use two queries (orders
first, then orderItems filtered by orderId) and stitch in application code — Drizzle relational queries or a
manual join with `inArray` both work; the manual approach matches what's done elsewhere.

**POST body shape** (what CheckoutClient will send):
```ts
{
  userId: string,
  shippingName: string,
  shippingPhone: string,
  shippingEmail: string,
  shippingAddress: string,
  shippingCity: string,
  shippingCountry: string,
  shippingPostalCode?: string,
  subtotal: number,
  shippingCost: number,
  total: number,
  currency: string,        // default 'USD'
  paymentMethod: 'cod' | 'card',
  notes?: string,
  items: Array<{
    productId: string,
    variantId?: string,
    productName: string,
    productImage: string | null,
    variantMetadata?: Record<string, unknown>,
    unitPrice: number,
    quantity: number,
    lineTotal: number,
  }>
}
```

**POST logic:**
1. Generate `orderNumber` as `FF-YYYY-XXXX` where YYYY = current year and XXXX = zero-padded 4-digit random
   number (`Math.floor(Math.random() * 9000) + 1000`).
2. `db.insert(orders).values({...}).returning()` — all numeric fields must be passed as strings to Drizzle
   (e.g. `subtotal: String(body.subtotal)`).
3. `db.insert(orderItems).values(items.map(...))` — map each item from the POST body to the orderItems shape,
   setting `lineTotal: String(item.unitPrice * item.quantity)`.
4. Insert a `new_order` notification:
   ```ts
   db.insert(notifications).values({
     type: 'new_order',
     title: `New Order ${orderNumber}`,
     message: `${body.shippingName} placed an order for $${body.total.toFixed(2)}`,
     referenceId: newOrder.id,
     referenceType: 'order',
   })
   ```
5. For each item in the POST body:
   - If `variantId` is set: decrement `productVariants.stock` by `item.quantity` using an SQL expression
     (`sql\`${productVariants.stock} - ${item.quantity}\``); if new stock < 5, insert a `low_stock`
     notification.
   - Else: decrement `products.stock` similarly and check the same threshold.
   - To check the post-update stock, do a `.returning()` on the update and read the returned stock value.
6. Return `NextResponse.json({ order: newOrder }, { status: 201 })`.

**Files:**
- `src/app/api/orders/route.ts` (create new)

**Verify:** `npx tsc --noEmit` — no errors. Manually POST to `/api/orders` via a browser devtools or curl and
confirm a 201 response and that a row appears in the orders table.

---

## Item 3 — Create `GET /api/orders/[id]` and `PATCH /api/orders/[id]`

Create `src/app/api/orders/[id]/route.ts`. Mirror the pattern in
`src/app/api/categories/[id]/route.ts` — note the `{ params }: { params: Promise<{ id: string }> }` signature
and the `const { id } = await params` call.

**GET** — select the order by id, select its items, return `{ order: { ...order, items } }` or 404.

**PATCH** — accept `{ status: string }`, update `orders.status` and `orders.updatedAt`, return the updated row.
Valid status values: `'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled'` — no server-side
validation needed beyond what the DB accepts; the kanban board will only send valid values.

**Files:**
- `src/app/api/orders/[id]/route.ts` (create new)

**Verify:** `npx tsc --noEmit` — no errors.

---

## Item 4 — Create `GET /api/notifications` and `PATCH /api/notifications`

Create `src/app/api/notifications/route.ts`.

**GET** — `db.select().from(notifications).orderBy(desc(notifications.createdAt))` — return the array directly
(not wrapped, matching the pattern other list routes use).

**PATCH body** — two modes:
- `{ id: string, isRead: true }` → update a single notification by id.
- `{ markAllRead: true }` → `db.update(notifications).set({ isRead: true })` (no WHERE clause — updates all).

Return `{ success: true }` for both modes.

**Files:**
- `src/app/api/notifications/route.ts` (create new)

**Verify:** `npx tsc --noEmit` — no errors.

---

## Item 5 — Wire checkout to `POST /api/orders`

Replace the `handleSubmit` TODO stub in `src/app/(storefront)/checkout/CheckoutClient.tsx`.

The `CartLine` type (from `CartProvider.tsx`) has: `{ productId, variantId?, variantLabel?, name, sku, price: number, imageUrl: string|null, quantity }`.

Map each `CartLine` to an order item as follows:
```ts
{
  productId: item.productId,
  variantId: item.variantId ?? null,
  productName: item.name,
  productImage: item.imageUrl,
  variantMetadata: item.variantLabel ? { label: item.variantLabel } : undefined,
  unitPrice: item.price,
  quantity: item.quantity,
  lineTotal: item.price * item.quantity,
}
```

POST body:
```ts
{
  userId: user.id,
  shippingName: formData.fullName,
  shippingPhone: formData.phone,
  shippingEmail: formData.email,
  shippingAddress: formData.address,
  shippingCity: formData.city,
  shippingCountry: formData.country,
  shippingPostalCode: formData.postalCode || undefined,
  subtotal,
  shippingCost,
  total,
  currency: 'USD',
  paymentMethod,
  notes: formData.notes || undefined,
  items: items.map(/* see above */),
}
```

On 201 response: `clearCart()` then `router.push('/checkout/success')`.
On non-201 response or catch: read the response body for an `error` field, set it to an `errorMessage` state,
display it in a `<p className="text-red-500 text-[13px] mt-2 text-center">` div above the submit button
(inside both the mobile form button block and the desktop sticky sidebar button block). Also call
`setIsSubmitting(false)` on error.

Add `const [errorMessage, setErrorMessage] = useState<string | null>(null)` state. Clear `errorMessage` at the
start of `handleSubmit` before the try block.

**Files:**
- `src/app/(storefront)/checkout/CheckoutClient.tsx`

**Verify:** `npx tsc --noEmit` — no errors. Load `/checkout` in dev, fill the form, submit, confirm the network
request goes to `/api/orders` and returns 201.

---

## Item 6 — Add `new_user` notification to the signup route

In `src/app/api/auth/signup/route.ts`:
1. Add `notifications` to the import from `@/db/schema`.
2. After the existing `db.insert(wishlists)...` call, insert a notification:
   ```ts
   await db.insert(notifications).values({
     type: 'new_user',
     title: 'New Customer Registered',
     message: `${fullName} just created an account.`,
     referenceId: newUser.id,
     referenceType: 'user',
   });
   ```

**Files:**
- `src/app/api/auth/signup/route.ts`

**Verify:** `npx tsc --noEmit` — no errors. Register a new account in dev and confirm a `new_user` row appears
in the notifications table.

---

## Item 7 — Build the full kanban `OrdersSection`

Replace `src/components/admin/sections/OrdersSection.tsx` completely.

**Architecture decisions:**
- `'use client'` component — data fetched via `useEffect` calling `/api/orders`, stored in state.
- No external DnD library — use HTML5 `draggable`, `onDragStart`, `onDragOver`, `onDrop` attributes.
- Order detail modal: controlled by `selectedOrder` state — null = closed, order object = open.
- All Drizzle numeric fields come back as strings; parse with `parseFloat()` before calling `.toFixed(2)`.

**State:**
```ts
const [orders, setOrders] = useState<any[]>([]);
const [loading, setLoading] = useState(true);
const [search, setSearch] = useState('');
const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
const [draggedId, setDraggedId] = useState<string | null>(null);
```

**Column config (defined as a `const` array outside the component):**
```ts
const COLUMNS = [
  { key: 'pending',    label: 'PENDING',    color: 'bg-yellow-100 text-yellow-700',  border: 'border-yellow-200' },
  { key: 'processing', label: 'PROCESSING', color: 'bg-blue-100 text-blue-700',      border: 'border-blue-200' },
  { key: 'shipped',    label: 'SHIPPED',    color: 'bg-cyan-100 text-cyan-700',       border: 'border-cyan-200' },
  { key: 'completed',  label: 'COMPLETED',  color: 'bg-green-100 text-green-700',    border: 'border-green-200' },
  { key: 'cancelled',  label: 'CANCELLED',  color: 'bg-red-100 text-red-700',        border: 'border-red-200' },
];
```

**Filtering:** `filteredOrders = orders.filter(o => search === '' || [o.shippingName, o.shippingEmail, o.orderNumber].some(f => f?.toLowerCase().includes(search.toLowerCase())))`.

**Card layout (inside each column):**
```
[status badge]
shippingName   (font-medium, text-[13px])
shippingAddress, shippingCity   (text-[11px] text-gray-500, truncate, 1 line)
$total   (text-[13px] font-medium, text-[#5433EB])
Sep 7   (text-[11px] text-gray-400, formatted with: new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
```

Card: `rounded-2xl bg-white border border-gray-100 shadow-sm p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-all`.

**DnD handlers:**
- `onDragStart`: set `draggedId` to the card's order id; set `e.dataTransfer.effectAllowed = 'move'`.
- Column `onDragOver`: `e.preventDefault(); e.dataTransfer.dropEffect = 'move'`.
- Column `onDrop`: if `draggedId` and the dropped column key differs from the dragged order's current status,
  optimistically update local state (`setOrders(prev => prev.map(...))`), then call
  `PATCH /api/orders/${draggedId}` with `{ status: newStatus }`. On error, re-fetch to restore truth.
  Always call `setDraggedId(null)` in a finally block.

**Top bar:**
```
<h1>Orders</h1>
<span>{filteredOrders.length} orders</span>
<input search />
<button Refresh onClick={fetchOrders} />
```

**Detail modal:** Full-screen overlay `fixed inset-0 z-50 bg-black/60 flex items-center justify-center`.
Inner card: `bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden`. Scrollable
body shows:
- Order number + status badge
- Payment method + payment status
- All shipping fields in a 2-col grid
- Items table: thumbnail (`w-10 h-10 rounded-lg object-cover`), productName, quantity, unitPrice, lineTotal
- Totals breakdown: Subtotal / Discount / Shipping / **Total**

Close button (X) top-right of modal header.

**Imports needed:** `useState, useEffect, useCallback` from react; `Image` from next/image;
`RefreshCw, X, Search` from lucide-react.

**Files:**
- `src/components/admin/sections/OrdersSection.tsx` (full replacement)

**Verify:** `npx tsc --noEmit` — no errors. Load `/admin/orders` in dev, confirm the 5 columns render, cards
appear, drag and drop triggers a PATCH, and clicking a card opens the detail modal.

---

## Item 8 — Replace mock notifications in `AdminSidebar` with real data

Edit `src/components/admin/AdminSidebar.tsx`:

1. Remove the `MOCK_NOTIFICATIONS` constant entirely.
2. Add state: `const [notifications, setNotifications] = useState<any[]>([])`.
3. Add a `fetchNotifications` async function (wrapped in `useCallback` with `[]` deps) that calls
   `GET /api/notifications` and sets state.
4. Call `fetchNotifications()` in a new `useEffect(() => { fetchNotifications(); }, [fetchNotifications])`.
5. Derive unread count: `const unreadCount = notifications.filter(n => !n.isRead).length`.

**Icon map function:**
```ts
function getNotifMeta(type: string) {
  switch(type) {
    case 'new_order':    return { Icon: ShoppingBag,   color: 'text-green-600',  bg: 'bg-green-50' };
    case 'low_stock':    return { Icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' };
    case 'new_user':     return { Icon: UserPlus,      color: 'text-blue-600',   bg: 'bg-blue-50' };
    case 'offer_expiring': return { Icon: Tag,         color: 'text-red-600',    bg: 'bg-red-50' };
    default:             return { Icon: Bell,          color: 'text-gray-600',   bg: 'bg-gray-50' };
  }
}
```
(All of `ShoppingBag`, `AlertTriangle`, `UserPlus`, `Tag`, `Bell` are already imported in the file.)

**Bell badge:** Replace the hardcoded dot `<span className="... w-2 h-2 ...">` with a conditional:
- If `unreadCount === 0`: render nothing.
- If `unreadCount > 0`: render `<span className="absolute top-2 right-2 min-w-[16px] h-4 bg-[#5433EB] text-white text-[9px] font-bold flex items-center justify-center rounded-full px-0.5 border-2 border-white">{unreadCount}</span>`.

**Notification rows:** Replace the `MOCK_NOTIFICATIONS.map(...)` block with `notifications.map(notif => { const { Icon, color, bg } = getNotifMeta(notif.type); ... })`. Use `notif.id`, `notif.title`, `notif.message`, and format `notif.createdAt` as a relative time string using a simple helper:
```ts
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
```

**Header badge:** Change the hardcoded `3 New` span to display `{unreadCount} New` (or hide it when 0).

**"Mark all as read" button:** Wire it to:
```ts
async () => {
  await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ markAllRead: true }) });
  fetchNotifications();
}
```

**If `notifications` is empty:** Render a `<p className="text-[13px] text-gray-400 px-4 py-6 text-center">No notifications</p>` in the list area.

**Files:**
- `src/components/admin/AdminSidebar.tsx`

**Verify:** `npx tsc --noEmit` — no errors. Open the admin sidebar in dev, click the bell, confirm real
notifications appear. Register a new user and confirm a `new_user` notification appears. Click "Mark all as
read" and confirm the badge clears.

---

## Build verification (final step)

After all 8 items are complete:

```
npm run build
```

Expected: build completes with no TypeScript or compilation errors. Any `Type error:` lines indicate a
missed fix and must be resolved before the plan is considered done.
