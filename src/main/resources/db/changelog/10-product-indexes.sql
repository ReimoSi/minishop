--liquibase formatted sql
--changeset reimo:product-search-sort-indexes
CREATE INDEX IF NOT EXISTS idx_product_name_trgm ON product USING gin ((lower(name)) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_product_sku_trgm  ON product USING gin ((lower(sku))  gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_product_price_cents ON product (price_cents);
CREATE INDEX IF NOT EXISTS idx_product_updated_at  ON product (updated_at);
CREATE INDEX IF NOT EXISTS idx_product_id          ON product (id);
--rollback DROP INDEX IF EXISTS idx_product_name_trgm;
--rollback DROP INDEX IF EXISTS idx_product_sku_trgm;
--rollback DROP INDEX IF EXISTS idx_product_price_cents;
--rollback DROP INDEX IF EXISTS idx_product_updated_at;
--rollback DROP INDEX IF EXISTS idx_product_id;
