-- CURRENCIES (idempotent)
INSERT INTO currency(code, name)
VALUES ('EUR', 'Euro'),
       ('USD', 'US Dollar'),
       ('GBP', 'Pound Sterling')
ON CONFLICT (code) DO NOTHING;

-- PRODUCTS (idempotent; viitame olemasolevale 'EUR' valuutale)
-- NB: product.sku on UNIQUE
INSERT INTO product (sku, name, price_cents, currency_code)
VALUES ('SKU-APPLE-001', 'Apple', 149, 'EUR'),
       ('SKU-MILK-001', 'Milk 1L', 129, 'EUR'),
       ('SKU-SAMSUNG-001', 'SAMSUNG', 1250, 'EUR'),
       ('SKU-SAMSUNG-002', 'SAMSUNG GALAXY', 750, 'EUR'),
       ('SKU-ONENOTE-001', 'ONENOTE', 625, 'EUR')
ON CONFLICT (sku) DO NOTHING;
