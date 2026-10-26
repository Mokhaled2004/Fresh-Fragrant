ALTER TABLE offers ADD COLUMN IF NOT EXISTS coupon_code varchar(100);
CREATE UNIQUE INDEX IF NOT EXISTS offers_coupon_code_unique_idx ON offers (coupon_code) WHERE coupon_code IS NOT NULL;
CREATE TABLE IF NOT EXISTS offer_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  package_id uuid NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS offer_packages_unique_idx ON offer_packages (offer_id, package_id);
CREATE INDEX IF NOT EXISTS offer_packages_offer_idx ON offer_packages (offer_id);
CREATE INDEX IF NOT EXISTS offer_packages_package_idx ON offer_packages (package_id);
