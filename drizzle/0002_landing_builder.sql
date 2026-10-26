CREATE TABLE IF NOT EXISTS landing_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type varchar(40) NOT NULL,
  title varchar(255),
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  display_order smallint NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS landing_sections_order_idx ON landing_sections (display_order);
CREATE INDEX IF NOT EXISTS landing_sections_active_idx ON landing_sections (is_active);
CREATE TABLE IF NOT EXISTS storefront_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_url text,
  nav_links jsonb NOT NULL DEFAULT '[]'::jsonb,
  header_visible boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO landing_sections (type, title, content, display_order, is_active)
SELECT 'hero', 'Hero', '{"eyebrow":"The latest drop","title":"Find your next favorite","subtitle":"Discover new styles and everyday essentials, picked for the way you move.","imageUrl":"","buttonText":"Explore products","buttonUrl":"#products"}'::jsonb, 0, true
WHERE NOT EXISTS (SELECT 1 FROM landing_sections WHERE type = 'hero');
INSERT INTO landing_sections (type, title, content, display_order, is_active)
SELECT 'product_grid', 'Featured products', '{"eyebrow":"Selected for you","title":"Shop the collection","productCount":8,"featuredOnly":false,"productIds":[],"buttonText":"","buttonUrl":"#products"}'::jsonb, 1, true
WHERE NOT EXISTS (SELECT 1 FROM landing_sections WHERE type = 'product_grid');