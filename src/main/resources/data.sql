INSERT INTO currency(code, name)
VALUES ('EUR', 'Euro'),
       ('USD', 'US Dollar'),
       ('GBP', 'Pound Sterling');

INSERT INTO product (sku, name, price_cents, currency_code)
VALUES ('SKU-APPLE-001', 'Apple', 149, 'EUR'),
       ('SKU-MILK-001', 'Milk 1L', 129, 'EUR');

INSERT INTO stock_movement (product_id, quantity_change, reason, reference)
VALUES (1, 100, 'IN', 'initial-load'),
       (2, 50, 'IN', 'initial-load'),
       (1, -2, 'OUT', 'sample-sale');