-- currency + product
INSERT INTO currency(code, name)
VALUES ('EUR', 'Euro'),
       ('USD', 'US Dollar'),
       ('GBP', 'Pound Sterling');

INSERT INTO product (sku, name, price_cents, currency_code)
VALUES ('SKU-APPLE-001', 'Apple', 149, 'EUR'),
       ('SKU-MILK-001', 'Milk 1L', 129, 'EUR');

-- stock_movement
INSERT INTO stock_movement (product_id, quantity_change, reason, reference)
VALUES (1, 100, 'IN', 'initial-load'),
       (2, 50, 'IN', 'initial-load'),
       (1, -2, 'OUT', 'sample-sale');

-- roles + admin user
INSERT INTO app_role(code, name) VALUES ('ADMIN','Administrator'), ('USER','User');

INSERT INTO app_user(email, password_hash, display_name, is_active)
VALUES ('admin@example.com', 'admin', 'Admin', TRUE); -- NB! plain 'admin' deviks; hiljem asendame BCryptiga

INSERT INTO app_user_role(user_id, role_id)
SELECT u.id, r.id FROM app_user u, app_role r
WHERE u.email = 'admin@example.com' AND r.code = 'ADMIN';

-- warehouse + default staging location
INSERT INTO warehouse(code, name) VALUES ('MAIN', 'Main warehouse');

INSERT INTO location(warehouse_id, code, type, is_pickable)
SELECT w.id, 'STAGING', 'STAGING', FALSE FROM warehouse w WHERE w.code='MAIN';

-- categories
INSERT INTO category(code, name) VALUES ('FRUIT','Fruit'), ('DAIRY','Dairy');

-- link existing products by SKU to categories (works with your earlier product seeds)
INSERT INTO product_category(product_id, category_id)
SELECT p.id, c.id FROM product p, category c
WHERE p.sku='SKU-APPLE-001' AND c.code='FRUIT';

INSERT INTO product_category(product_id, category_id)
SELECT p.id, c.id FROM product p, category c
WHERE p.sku='SKU-MILK-001' AND c.code='DAIRY';