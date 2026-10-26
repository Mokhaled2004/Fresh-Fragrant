# Orders + Notifications Review

## Evidence Summary

### 1. `src/db/schema.ts` — notifications table
- `notifications` table is present with correct columns: `id` (uuid PK), `type` (varchar 50), `title` (varchar 255), `message` (text), `referenceId` (uuid, nullable), `referenceType` (varchar 50, nullable), `isRead` (boolean, default false), `createdAt` (timestamp with timezone).
- Three indexes defined: `notifications_type_idx`, `notifications_is_read_idx`, `notifications_created_at_idx`.
- `Notification` and `NewNotification` type exports present.
- Import uses `uuid`, `varchar`, `text`, `boolean`, `timestamp`, `index` — all from `drizzle-orm/pg-core`. ✅

### 2. `src/app/api/orders/route.ts`
- Imports: `db` from `@/db`, tables from `@/db/schema`. ✅
- `GET`: fetches all orders ordered by `desc(orders.createdAt)`, then fetches items per order via a second query. Returns `{ orders: result }`. ✅
- `POST`:
  - Order number format: `FF-${year}-${String(count + 1).padStart(4, '0')}` — matches `FF-YYYY-XXXX`. ✅
  - Inserts order, then order items, then `new_order` notification. ✅
  - Decrements stock per item using `sql\`${products.stock} - ${item.quantity}\`` then re-fetches to check `< 5`. ✅
  - Fires `low_stock` notification when `stock < 5`. ✅
  - Returns 201 with `{ order: newOrder }`. ✅

### 3. `src/app/api/orders/[id]/route.ts`
- `GET` and `PATCH` both use `{ params }: { params: Promise<{ id: string }> }` and `await params`. ✅ (Next.js 15 pattern)
- Valid statuses: `['pending', 'processing', 'shipped', 'completed', 'cancelled']` — matches the 5 kanban columns. ✅
- `updatedAt: new Date()` set on PATCH. ✅

### 4. `src/app/api/notifications/route.ts`
- `GET`: fetches all, ordered by `desc(notifications.createdAt)`. ✅
- `PATCH`: handles `markAllRead: true` (no WHERE clause, updates all) and `id` (marks single). Returns 400 for invalid body. ✅

### 5. `src/app/(storefront)/checkout/CheckoutClient.tsx`
- `'use client'` directive present. ✅
- Real `fetch('/api/orders', { method: 'POST', ... })` — no TODO stub. ✅
- Cart items mapped: `productId`, `variantId`, `productName`, `productImage`, `unitPrice`, `quantity`, `lineTotal` — all fields match `orderItems` schema. ✅
- Error state set on failure, displayed as `<p className="text-red-600 ...">{checkoutError}</p>`. ✅
- On success: `clearCart()` called, then `router.push('/checkout/success')`. ✅
- `clearCart` is present in `CartProvider` context. ✅

### 6. `src/app/api/auth/signup/route.ts`
- After user creation, inserts notification with `type: 'new_user'`, `title: 'New Customer Registered'`, `referenceId: newUser.id`, `referenceType: 'user'`. ✅
- `notifications` imported from `@/db/schema`. ✅

### 7. `src/components/admin/sections/OrdersSection.tsx`
- `'use client'` directive present. ✅
- Full kanban board: 5 columns (`pending`, `processing`, `shipped`, `completed`, `cancelled`). ✅
- Drag and drop via native HTML5 `draggable`, `onDragStart`, `onDragOver`, `onDrop` — no external DnD library imported. ✅
- Detail modal on card click with shipping details, items table, totals, and status-change buttons. ✅
- Search bar filtering by name, email, order number. ✅
- Refresh button. ✅

### 8. `src/components/admin/AdminSidebar.tsx`
- `'use client'` directive present. ✅
- `MOCK_NOTIFICATIONS` is absent. ✅
- `fetchNotifications()` calls `fetch('/api/notifications')` on mount. ✅
- `unreadCount` derived from `realNotifications.filter((n) => !n.isRead).length`. ✅
- Unread badge renders when `unreadCount > 0`. ✅
- "Mark all as read" button calls `PATCH /api/notifications` with `{ markAllRead: true }` then re-fetches. ✅

## Findings

No blocking issues found. All checklist items pass. One non-blocking observation (out of scope for blocking): the `referenceId` column is typed as `uuid` in the schema, which is correct for all three insertion sites (`newUser.id`, `newOrder.id`, `updatedProduct.id` — all UUIDs). No correction needed.
