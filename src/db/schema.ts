import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  index,
  uniqueIndex,
  jsonb,
  smallint,
  numeric,
  integer,
} from "drizzle-orm/pg-core";
import { relations, sql } from 'drizzle-orm';

/**
 * ============================================================================
 * USERS
 * ============================================================================
 */
// ... (keep existing users table and its relations if any)
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phoneNumber: varchar("phone_number", { length: 30 }),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    role: varchar("role", { length: 20 }).notNull().default("customer"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("users_email_unique_idx").on(table.email),
    index("users_email_idx").on(table.email),
    index("users_phone_idx").on(table.phoneNumber),
    index("users_role_idx").on(table.role),
    index("users_is_active_idx").on(table.isActive),
    index("users_created_at_idx").on(table.createdAt),
  ],
);

// ... (other tables remain as they were) ...
// (I will apply the relations at the end of the file or after table definitions)

/**
 * ============================================================================
 * CATEGORIES
 * ============================================================================
 *
 * Supports hierarchical categories:
 *
 * Electronics
 *   ├── Phones
 *   ├── Laptops
 *   └── Accessories
 *
 * Fashion
 *   ├── Men
 *   └── Women
 */
export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    parentCategoryId: uuid("parent_category_id").references(
      (): any => categories.id,
      {
        onDelete: "set null",
      },
    ),

    slug: varchar("slug", { length: 255 }).notNull(),

    name: varchar("name", { length: 255 }).notNull(),

    description: text("description"),

    imageUrl: text("image_url"),

    displayOrder: smallint("display_order").notNull().default(0),

    isActive: boolean("is_active").notNull().default(true),

    /**
     * Extra category-specific information.
     *
     * Example:
     * {
     *   "icon": "shirt",
     *   "color": "var(--theme-textStrong)"
     * }
     */
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .default({}),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    deletedAt: timestamp("deleted_at", {
      withTimezone: true,
    }),
  },

  (table) => [
    uniqueIndex("categories_slug_unique_idx").on(table.slug),

    index("categories_parent_category_idx").on(table.parentCategoryId),

    index("categories_is_active_idx").on(table.isActive),

    index("categories_deleted_at_idx").on(table.deletedAt),

    index("categories_display_order_idx").on(table.displayOrder),
  ],
);

/**
 * ============================================================================
 * PRODUCTS
 * ============================================================================
 *
 * Core product information lives in normal relational columns.
 *
 * Category-specific information lives in metadata JSONB.
 *
 * Example Fashion:
 * {
 *   "color": "red",
 *   "material": "cotton",
 *   "gender": "men"
 * }
 *
 * Example Electronics:
 * {
 *   "ram": "16GB",
 *   "storage": "512GB",
 *   "processor": "Intel i7"
 * }
 */
export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    sku: varchar("sku", { length: 100 }).notNull(),

    slug: varchar("slug", { length: 255 }).notNull(),

    name: varchar("name", { length: 255 }).notNull(),

    description: text("description"),

    price: numeric("price", {
      precision: 12,
      scale: 2,
    }).notNull(),

    costPrice: numeric("cost_price", {
      precision: 12,
      scale: 2,
    }),

    compareAtPrice: numeric("compare_at_price", {
      precision: 12,
      scale: 2,
    }),

    stock: integer("stock").notNull().default(0),

    weight: numeric("weight", {
      precision: 10,
      scale: 3,
    }),

    dimensions: jsonb("dimensions").$type<{
      length?: number;
      width?: number;
      height?: number;
      unit?: string;
    }>(),

    imageUrl: text("image_url"),

    galleryUrls: text("gallery_urls").array(),

    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),

    seoMetaTitle: varchar("seo_meta_title", {
      length: 60,
    }),

    seoMetaDescription: varchar("seo_meta_description", {
      length: 160,
    }),

    rating: numeric("rating", {
      precision: 2,
      scale: 1,
    })
      .notNull()
      .default("0"),

    ratingCount: integer("rating_count").notNull().default(0),

    isActive: boolean("is_active").notNull().default(true),

    isFeatured: boolean("is_featured").notNull().default(false),

    /**
     * Category-specific product information.
     *
     * Examples:
     *
     * Fashion:
     * {
     *   "color": "red",
     *   "material": "cotton",
     *   "gender": "men"
     * }
     *
     * Electronics:
     * {
     *   "ram": "16GB",
     *   "storage": "512GB SSD"
     * }
     *
     * Grocery:
     * {
     *   "unit": "kg",
     *   "organic": true
     * }
     */
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .default({}),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    deletedAt: timestamp("deleted_at", {
      withTimezone: true,
    }),
  },

  (table) => [
    uniqueIndex("products_sku_unique_idx").on(table.sku),

    uniqueIndex("products_slug_unique_idx").on(table.slug),

    index("products_category_idx").on(table.categoryId),

    index("products_is_active_idx").on(table.isActive),

    index("products_is_featured_idx").on(table.isFeatured),

    index("products_price_idx").on(table.price),

    index("products_stock_idx").on(table.stock),

    index("products_rating_idx").on(table.rating),

    index("products_deleted_at_idx").on(table.deletedAt),
  ],
);

/**
 * ============================================================================
 * PRODUCT VARIANTS
 * ============================================================================
 *
 * Used when a product has multiple purchasable configurations.
 *
 * Example:
 *
 * T-Shirt
 *
 * Variant 1:
 *   color: red
 *   size: M
 *   sku: SHIRT-RED-M
 *
 * Variant 2:
 *   color: red
 *   size: L
 *   sku: SHIRT-RED-L
 *
 * Electronics can also use this:
 *
 * iPhone
 *   storage: 128GB
 *   color: Black
 *
 * iPhone
 *   storage: 256GB
 *   color: Black
 */
export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, {
        onDelete: "cascade",
      }),

    sku: varchar("sku", { length: 100 }).notNull(),

    price: numeric("price", {
      precision: 12,
      scale: 2,
    }),

    stock: integer("stock").notNull().default(0),

    imageUrl: text("image_url"),

    /**
     * Variant-specific attributes.
     *
     * Example:
     * {
     *   "color": "red",
     *   "size": "M"
     * }
     */
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .default({}),

    isActive: boolean("is_active").notNull().default(true),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },

  (table) => [
    uniqueIndex("product_variants_sku_unique_idx").on(table.sku),

    index("product_variants_product_idx").on(table.productId),

    index("product_variants_is_active_idx").on(table.isActive),
  ],
);

/**
 * ============================================================================
 * PACKAGES
 * ============================================================================
 *
 * Product bundles.
 *
 * Example:
 *
 * Gaming Package
 *   ├── Gaming PC
 *   ├── Keyboard
 *   └── Mouse
 */
export const packages = pgTable(
  "packages",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    slug: varchar("slug", { length: 255 }).notNull(),

    name: varchar("name", { length: 255 }).notNull(),

    description: text("description"),

    offeredPrice: numeric("offered_price", {
      precision: 12,
      scale: 2,
    }).notNull(),

    originalPrice: numeric("original_price", {
      precision: 12,
      scale: 2,
    }),

    imageUrl: text("image_url"),

    galleryUrls: text("gallery_urls").array(),

    seoMetaTitle: varchar("seo_meta_title", {
      length: 60,
    }),

    seoMetaDescription: varchar("seo_meta_description", {
      length: 160,
    }),

    isActive: boolean("is_active").notNull().default(true),

    isFeatured: boolean("is_featured").notNull().default(false),

    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .default({}),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    deletedAt: timestamp("deleted_at", {
      withTimezone: true,
    }),
  },

  (table) => [
    uniqueIndex("packages_slug_unique_idx").on(table.slug),

    index("packages_is_active_idx").on(table.isActive),

    index("packages_is_featured_idx").on(table.isFeatured),

    index("packages_offered_price_idx").on(table.offeredPrice),

    index("packages_deleted_at_idx").on(table.deletedAt),
  ],
);

/**
 * ============================================================================
 * PACKAGE ITEMS
 * ============================================================================
 */

export const packageItems = pgTable(
  "package_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    packageId: uuid("package_id")
      .notNull()
      .references(() => packages.id, {
        onDelete: "cascade",
      }),

    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, {
        onDelete: "restrict",
      }),

    variantId: uuid("variant_id")
      .references(() => productVariants.id, {
        onDelete: "set null",
      }),

    quantity: integer("quantity").notNull().default(1),

    displayOrder: smallint("display_order").notNull().default(0),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },

  (table) => [
    uniqueIndex("package_items_package_product_variant_unique_idx").on(
      table.packageId,
      table.productId,
      table.variantId,
    ),
    index("package_items_package_idx").on(table.packageId),
    index("package_items_product_idx").on(table.productId),
    index("package_items_variant_idx").on(table.variantId),
  ],
);

/**
 * ============================================================================
 * OFFERS
 * ============================================================================
 *
 * Generic promotional offers.
 *
 * Supported types can be handled at the service/business-logic level:
 *
 * percentage
 * fixed_amount
 * buy_x_get_y
 * etc.
 */
export const offers = pgTable(
  "offers",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: varchar("name", { length: 255 }).notNull(),

    description: text("description"),

    type: varchar("type", { length: 50 }).notNull(),

    couponCode: varchar("coupon_code", { length: 100 }),

    value: numeric("value", {
      precision: 12,
      scale: 2,
    }),

    minimumOrderAmount: numeric("minimum_order_amount", {
      precision: 12,
      scale: 2,
    }),

    maximumDiscountAmount: numeric("maximum_discount_amount", {
      precision: 12,
      scale: 2,
    }),

    startAt: timestamp("start_at", {
      withTimezone: true,
    }),

    endAt: timestamp("end_at", {
      withTimezone: true,
    }),

    isActive: boolean("is_active").notNull().default(true),

    /**
     * Additional offer configuration.
     *
     * Example:
     * {
     *   "buyQuantity": 2,
     *   "getQuantity": 1
     * }
     */
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .default({}),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },

  (table) => [
    uniqueIndex("offers_coupon_code_unique_idx").on(table.couponCode).where(sql`${table.couponCode} IS NOT NULL`),
    index("offers_is_active_idx").on(table.isActive),

    index("offers_start_at_idx").on(table.startAt),

    index("offers_end_at_idx").on(table.endAt),

    index("offers_type_idx").on(table.type),
  ],
);

/**
 * ============================================================================
 * OFFER PRODUCTS
 * ============================================================================
 *
 * Associates an offer with specific products.
 */
export const offerProducts = pgTable(
  "offer_products",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    offerId: uuid("offer_id")
      .notNull()
      .references(() => offers.id, {
        onDelete: "cascade",
      }),

    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, {
        onDelete: "cascade",
      }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },

  (table) => [
    uniqueIndex("offer_products_unique_idx").on(
      table.offerId,
      table.productId,
    ),

    index("offer_products_offer_idx").on(table.offerId),

    index("offer_products_product_idx").on(table.productId),
  ],
);

/**
 * ============================================================================
 * OFFER CATEGORIES
 * ============================================================================
 *
 * Associates an offer with an entire category.
 */
export const offerCategories = pgTable(
  "offer_categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    offerId: uuid("offer_id")
      .notNull()
      .references(() => offers.id, {
        onDelete: "cascade",
      }),

    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, {
        onDelete: "cascade",
      }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },

  (table) => [
    uniqueIndex("offer_categories_unique_idx").on(
      table.offerId,
      table.categoryId,
    ),

    index("offer_categories_offer_idx").on(table.offerId),

    index("offer_categories_category_idx").on(table.categoryId),
  ],
);

/**
 * ============================================================================
 * OFFER VARIANTS
 * ============================================================================
 *
 * Associates an offer with specific variants.
 */
export const offerVariants = pgTable(
  "offer_variants",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    offerId: uuid("offer_id")
      .notNull()
      .references(() => offers.id, {
        onDelete: "cascade",
      }),

    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id, {
        onDelete: "cascade",
      }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },

  (table) => [
    uniqueIndex("offer_variants_unique_idx").on(
      table.offerId,
      table.variantId,
    ),

    index("offer_variants_offer_idx").on(table.offerId),

    index("offer_variants_variant_id_idx").on(table.variantId),
  ],
);

export const offerPackages = pgTable("offer_packages", {
  id: uuid("id").defaultRandom().primaryKey(),
  offerId: uuid("offer_id").notNull().references(() => offers.id, { onDelete: "cascade" }),
  packageId: uuid("package_id").notNull().references(() => packages.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("offer_packages_unique_idx").on(table.offerId, table.packageId),
  index("offer_packages_offer_idx").on(table.offerId),
  index("offer_packages_package_idx").on(table.packageId),
]);

/**
 * ============================================================================
 * CARTS
 * ============================================================================
 *
 * One active cart per authenticated user.
 */
export const carts = pgTable(
  "carts",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },

  (table) => [
    uniqueIndex("carts_user_unique_idx").on(table.userId),

    index("carts_user_idx").on(table.userId),
  ],
);

/**
 * ============================================================================
 * CART ITEMS
 * ============================================================================
 */
export const cartItems = pgTable(
  "cart_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    cartId: uuid("cart_id")
      .notNull()
      .references(() => carts.id, {
        onDelete: "cascade",
      }),

    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, {
        onDelete: "cascade",
      }),

    variantId: uuid("variant_id").references(() => productVariants.id, {
      onDelete: "set null",
    }),

    quantity: integer("quantity").notNull().default(1),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },

  (table) => [
    index("cart_items_cart_idx").on(table.cartId),

    index("cart_items_product_idx").on(table.productId),

    index("cart_items_variant_idx").on(table.variantId),
  ],
);

/**
 * ============================================================================
 * WISHLISTS
 * ============================================================================
 */
export const wishlists = pgTable(
  "wishlists",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },

  (table) => [
    uniqueIndex("wishlists_user_unique_idx").on(table.userId),

    index("wishlists_user_idx").on(table.userId),
  ],
);

/**
 * ============================================================================
 * WISHLIST ITEMS
 * ============================================================================
 */
export const wishlistItems = pgTable(
  "wishlist_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    wishlistId: uuid("wishlist_id")
      .notNull()
      .references(() => wishlists.id, {
        onDelete: "cascade",
      }),

    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, {
        onDelete: "cascade",
      }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },

  (table) => [
    uniqueIndex("wishlist_items_unique_idx").on(
      table.wishlistId,
      table.productId,
    ),

    index("wishlist_items_wishlist_idx").on(table.wishlistId),

    index("wishlist_items_product_idx").on(table.productId),
  ],
);

/**
 * ============================================================================
 * USER ADDRESSES
 * ============================================================================
 *
 * Used by the profile page and checkout.
 */
export const userAddresses = pgTable(
  "user_addresses",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    label: varchar("label", { length: 50 }),

    fullName: varchar("full_name", {
      length: 255,
    }).notNull(),

    phoneNumber: varchar("phone_number", {
      length: 30,
    }).notNull(),

    addressLine: text("address_line").notNull(),

    city: varchar("city", {
      length: 100,
    }).notNull(),

    country: varchar("country", {
      length: 100,
    }).notNull(),

    postalCode: varchar("postal_code", {
      length: 20,
    }),

    isDefault: boolean("is_default")
      .notNull()
      .default(false),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },

  (table) => [
    index("user_addresses_user_idx").on(table.userId),

    index("user_addresses_default_idx").on(
      table.userId,
      table.isDefault,
    ),
  ],
);

/**
 * ============================================================================
 * ORDERS
 * ============================================================================
 */
export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    orderNumber: varchar("order_number", {
      length: 50,
    }).notNull(),

    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),

    /**
     * Customer shipping snapshot.
     *
     * We intentionally store the values directly on the order.
     *
     * If the customer changes their profile/address later,
     * the historical order must not change.
     */
    shippingName: varchar("shipping_name", {
      length: 255,
    }).notNull(),

    shippingPhone: varchar("shipping_phone", {
      length: 30,
    }).notNull(),

    shippingEmail: varchar("shipping_email", {
      length: 255,
    }),

    shippingAddress: text("shipping_address").notNull(),

    shippingCity: varchar("shipping_city", {
      length: 100,
    }).notNull(),

    shippingCountry: varchar("shipping_country", {
      length: 100,
    }).notNull(),

    shippingPostalCode: varchar("shipping_postal_code", {
      length: 20,
    }),

    subtotal: numeric("subtotal", {
      precision: 12,
      scale: 2,
    }).notNull(),

    discount: numeric("discount", {
      precision: 12,
      scale: 2,
    })
      .notNull()
      .default("0"),

    shippingCost: numeric("shipping_cost", {
      precision: 12,
      scale: 2,
    })
      .notNull()
      .default("0"),

    total: numeric("total", {
      precision: 12,
      scale: 2,
    }).notNull(),

    currency: varchar("currency", {
      length: 3,
    })
      .notNull()
      .default("EGP"),

    status: varchar("status", {
      length: 30,
    })
      .notNull()
      .default("pending"),

    paymentStatus: varchar("payment_status", {
      length: 30,
    })
      .notNull()
      .default("pending"),

    paymentMethod: varchar("payment_method", {
      length: 50,
    }),

    notes: text("notes"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },

  (table) => [
    uniqueIndex("orders_order_number_unique_idx").on(
      table.orderNumber,
    ),

    index("orders_user_idx").on(table.userId),

    index("orders_status_idx").on(table.status),

    index("orders_payment_status_idx").on(table.paymentStatus),

    index("orders_created_at_idx").on(table.createdAt),
  ],
);

/**
 * ============================================================================
 * ORDER ITEMS
 * ============================================================================
 *
 * Historical snapshot of purchased products.
 *
 * We store productName, productImage and unitPrice directly
 * so old orders remain correct even if the product changes later.
 */
export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, {
        onDelete: "cascade",
      }),

    productId: uuid("product_id").references(() => products.id, {
      onDelete: "set null",
    }),

    variantId: uuid("variant_id").references(
      () => productVariants.id,
      {
        onDelete: "set null",
      },
    ),

    productName: varchar("product_name", {
      length: 255,
    }).notNull(),

    productImage: text("product_image"),

    variantMetadata: jsonb("variant_metadata").$type<
      Record<string, unknown>
    >(),

    unitPrice: numeric("unit_price", {
      precision: 12,
      scale: 2,
    }).notNull(),

    quantity: integer("quantity").notNull().default(1),

    lineTotal: numeric("line_total", {
      precision: 12,
      scale: 2,
    }).notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },

  (table) => [
    index("order_items_order_idx").on(table.orderId),

    index("order_items_product_idx").on(table.productId),

    index("order_items_variant_idx").on(table.variantId),
  ],
);

/**
 * ============================================================================
 * LANDING PAGE - HERO
 * ============================================================================
 *
 * IMPORTANT:
 *
 * The admin does NOT control:
 * - colors
 * - fonts
 * - layout
 * - spacing
 * - animations
 * - component structure
 *
 * Those are all built into the frontend.
 *
 * The admin only controls the content:
 * - title
 * - subtitle
 * - image
 * - button text
 * - button URL
 */
export const landingHero = pgTable(
  "landing_hero",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    title: varchar("title", {
      length: 255,
    }),

    subtitle: text("subtitle"),

    imageUrl: text("image_url"),

    buttonText: varchar("button_text", {
      length: 100,
    }),

    buttonUrl: text("button_url"),

    isActive: boolean("is_active").notNull().default(true),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },

  (table) => [
    index("landing_hero_active_idx").on(table.isActive),
  ],
);

/**
 * ============================================================================
 * LANDING PAGE - HERO SLIDES
 * ============================================================================
 *
 * The frontend owns the slider design.
 *
 * Admin controls the actual slide content.
 */
export const landingHeroSlides = pgTable(
  "landing_hero_slides",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    title: varchar("title", {
      length: 255,
    }),

    subtitle: text("subtitle"),

    imageUrl: text("image_url").notNull(),

    buttonText: varchar("button_text", {
      length: 100,
    }),

    buttonUrl: text("button_url"),

    displayOrder: smallint("display_order")
      .notNull()
      .default(0),

    isActive: boolean("is_active")
      .notNull()
      .default(true),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },

  (table) => [
    index("landing_hero_slides_order_idx").on(
      table.displayOrder,
    ),

    index("landing_hero_slides_active_idx").on(
      table.isActive,
    ),
  ],
);

/**
 * ============================================================================
 * LANDING PAGE - PROMOTIONAL BANNERS
 * ============================================================================
 *
 * Again, the design is fixed in code.
 *
 * Admin controls:
 * - image
 * - title
 * - subtitle
 * - button
 * - link
 */
export const landingBanners = pgTable(
  "landing_banners",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    title: varchar("title", {
      length: 255,
    }),

    subtitle: text("subtitle"),

    imageUrl: text("image_url").notNull(),

    buttonText: varchar("button_text", {
      length: 100,
    }),

    buttonUrl: text("button_url"),

    displayOrder: smallint("display_order")
      .notNull()
      .default(0),

    isActive: boolean("is_active")
      .notNull()
      .default(true),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },

  (table) => [
    index("landing_banners_order_idx").on(
      table.displayOrder,
    ),

    index("landing_banners_active_idx").on(
      table.isActive,
    ),
  ],
);

export const landingSections = pgTable("landing_sections", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: varchar("type", { length: 40 }).notNull(),
  title: varchar("title", { length: 255 }),
  content: jsonb("content").$type<Record<string, any>>().notNull().default({}),
  displayOrder: smallint("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("landing_sections_order_idx").on(table.displayOrder),
  index("landing_sections_active_idx").on(table.isActive),
]);

export const storefrontSettings = pgTable("storefront_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  logoUrl: text("logo_url"),
  navLinks: jsonb("nav_links").$type<Array<{ label: string; href: string }>>().notNull().default([]),
  headerVisible: boolean("header_visible").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * ============================================================================
 * NOTIFICATIONS
 * ============================================================================
 */
export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    type: varchar('type', { length: 50 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    message: text('message').notNull(),
    referenceId: uuid('reference_id'),
    referenceType: varchar('reference_type', { length: 50 }),
    isRead: boolean('is_read').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('notifications_type_idx').on(table.type),
    index('notifications_is_read_idx').on(table.isRead),
    index('notifications_created_at_idx').on(table.createdAt),
  ],
);

/**
 * ============================================================================
 * TYPE EXPORTS
 * ============================================================================
 */

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type ProductVariant =
  typeof productVariants.$inferSelect;

export type NewProductVariant =
  typeof productVariants.$inferInsert;

export type Package = typeof packages.$inferSelect;
export type NewPackage = typeof packages.$inferInsert;

export type PackageItem =
  typeof packageItems.$inferSelect;

export type NewPackageItem =
  typeof packageItems.$inferInsert;

export type Offer = typeof offers.$inferSelect;
export type NewOffer = typeof offers.$inferInsert;

export type OfferProduct =
  typeof offerProducts.$inferSelect;

export type NewOfferProduct =
  typeof offerProducts.$inferInsert;

export type OfferCategory =
  typeof offerCategories.$inferSelect;

export type NewOfferCategory =
  typeof offerCategories.$inferInsert;

export type OfferVariant =
  typeof offerVariants.$inferSelect;

export type NewOfferVariant =
  typeof offerVariants.$inferInsert;

export type OfferPackage = typeof offerPackages.$inferSelect;
export type NewOfferPackage = typeof offerPackages.$inferInsert;

export type Cart = typeof carts.$inferSelect;
export type NewCart = typeof carts.$inferInsert;

export type CartItem =
  typeof cartItems.$inferSelect;

export type NewCartItem =
  typeof cartItems.$inferInsert;

export type Wishlist =
  typeof wishlists.$inferSelect;

export type NewWishlist =
  typeof wishlists.$inferInsert;

export type WishlistItem =
  typeof wishlistItems.$inferSelect;

export type NewWishlistItem =
  typeof wishlistItems.$inferInsert;

export type UserAddress =
  typeof userAddresses.$inferSelect;

export type NewUserAddress =
  typeof userAddresses.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type OrderItem =
  typeof orderItems.$inferSelect;

export type NewOrderItem =
  typeof orderItems.$inferInsert;

export type LandingHero =
  typeof landingHero.$inferSelect;

export type NewLandingHero =
  typeof landingHero.$inferInsert;

export type LandingHeroSlide =
  typeof landingHeroSlides.$inferSelect;

export type NewLandingHeroSlide =
  typeof landingHeroSlides.$inferInsert;

export type LandingBanner =
  typeof landingBanners.$inferSelect;

export type NewLandingBanner =
  typeof landingBanners.$inferInsert;

export type LandingSection = typeof landingSections.$inferSelect;
export type NewLandingSection = typeof landingSections.$inferInsert;
export type StorefrontSetting = typeof storefrontSettings.$inferSelect;
export type NewStorefrontSetting = typeof storefrontSettings.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

/**
 * ============================================================================
 * ADMIN SETTINGS
 * ============================================================================
 */
export const adminSettings = pgTable('admin_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  // Store info
  storeName: varchar('store_name', { length: 255 }).notNull().default('Fresh & Fragrant'),
  storeEmail: varchar('store_email', { length: 255 }),
  storePhone: varchar('store_phone', { length: 50 }),
  storeAddress: text('store_address'),
  storeCurrency: varchar('store_currency', { length: 10 }).notNull().default('EGP'),
  // Inventory
  lowStockThreshold: integer('low_stock_threshold').notNull().default(5),
  // Notifications
  notifyOnNewOrder: boolean('notify_on_new_order').notNull().default(true),
  notifyOnLowStock: boolean('notify_on_low_stock').notNull().default(true),
  notifyOnNewUser: boolean('notify_on_new_user').notNull().default(true),
  // Admin account
  adminName: varchar('admin_name', { length: 255 }),
  adminEmail: varchar('admin_email', { length: 255 }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type AdminSetting = typeof adminSettings.$inferSelect;
export type NewAdminSetting = typeof adminSettings.$inferInsert;

export const offersRelations = relations(offers, ({ many }) => ({
  offerProducts: many(offerProducts),
  offerCategories: many(offerCategories),
  offerVariants: many(offerVariants),
  offerPackages: many(offerPackages),
}));

export const offerPackagesRelations = relations(offerPackages, ({ one }) => ({
  offer: one(offers, { fields: [offerPackages.offerId], references: [offers.id] }),
  package: one(packages, { fields: [offerPackages.packageId], references: [packages.id] }),
}));

export const offerProductsRelations = relations(offerProducts, ({ one }) => ({
  offer: one(offers, { fields: [offerProducts.offerId], references: [offers.id] }),
  product: one(products, { fields: [offerProducts.productId], references: [products.id] }),
}));

export const offerCategoriesRelations = relations(offerCategories, ({ one }) => ({
  offer: one(offers, { fields: [offerCategories.offerId], references: [offers.id] }),
  category: one(categories, { fields: [offerCategories.categoryId], references: [categories.id] }),
}));

export const offerVariantsRelations = relations(offerVariants, ({ one }) => ({
  offer: one(offers, { fields: [offerVariants.offerId], references: [offers.id] }),
  variant: one(productVariants, { fields: [offerVariants.variantId], references: [productVariants.id] }),
}));

export const productsRelations = relations(products, ({ many, one }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  variants: many(productVariants),
  offerProducts: many(offerProducts),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
  offerCategories: many(offerCategories),
}));

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, { fields: [productVariants.productId], references: [products.id] }),
  offerVariants: many(offerVariants),
}));
