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
SELECT p.id, 100, 'IN',  'initial-load' FROM product p WHERE p.sku='SKU-APPLE-001';

INSERT INTO stock_movement (product_id, quantity_change, reason, reference)
SELECT p.id,  50, 'IN',  'initial-load' FROM product p WHERE p.sku='SKU-MILK-001';

INSERT INTO stock_movement (product_id, quantity_change, reason, reference)
SELECT p.id,  -2, 'OUT', 'sample-sale'   FROM product p WHERE p.sku='SKU-APPLE-001';

-- Roles
MERGE INTO app_role r
USING (VALUES ('ADMIN','Administrator'),('USER','User')) AS v(code,name)
ON (r.code=v.code)
WHEN MATCHED THEN UPDATE SET name=v.name
WHEN NOT MATCHED THEN INSERT (code,name) VALUES (v.code,v.name);

-- Admin user (parool hiljem BCrypt)
MERGE INTO app_user u
USING (VALUES ('admin@example.com','admin','Admin', TRUE)) AS v(email,pwd,disp,act)
ON (u.email=v.email)
WHEN MATCHED THEN UPDATE SET display_name=v.disp, is_active=v.act
WHEN NOT MATCHED THEN INSERT (email,password_hash,display_name,is_active) VALUES (v.email,v.pwd,v.disp,v.act);

-- Link ADMIN roll (väldi duplikaati)
INSERT INTO app_user_role(user_id, role_id)
SELECT u.id, r.id
FROM app_user u JOIN app_role r ON r.code='ADMIN'
WHERE u.email='admin@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM app_user_role x WHERE x.user_id=u.id AND x.role_id=r.id
);

-- warehouse
MERGE INTO warehouse w
USING (VALUES ('MAIN','Main warehouse')) AS v(code,name)
ON (w.code = v.code)
WHEN MATCHED THEN UPDATE SET name = v.name
WHEN NOT MATCHED THEN INSERT (code, name) VALUES (v.code, v.name);

-- default staging location
MERGE INTO location l
USING (
    SELECT w.id AS warehouse_id, 'STAGING' AS code, 'STAGING' AS type, FALSE AS is_pickable
    FROM warehouse w
    WHERE w.code = 'MAIN'
) s
ON (l.warehouse_id = s.warehouse_id AND l.code = s.code)
WHEN NOT MATCHED THEN INSERT (warehouse_id, code, type, is_pickable)
                      VALUES (s.warehouse_id, s.code, s.type, s.is_pickable);

-- categories
MERGE INTO category c
USING (VALUES ('FRUIT','Fruit')) AS v(code, name)
ON (c.code = v.code)
WHEN MATCHED THEN UPDATE SET name = v.name, is_active = TRUE
WHEN NOT MATCHED THEN INSERT (code, name, is_active) VALUES (v.code, v.name, TRUE);

MERGE INTO category c
USING (VALUES ('DAIRY','Dairy')) AS v(code, name)
ON (c.code = v.code)
WHEN MATCHED THEN UPDATE SET name = v.name, is_active = TRUE
WHEN NOT MATCHED THEN INSERT (code, name, is_active) VALUES (v.code, v.name, TRUE);

-- product+category linking
INSERT INTO product_category(product_id, category_id)
SELECT p.id, c.id
FROM product p, category c
WHERE p.sku='SKU-APPLE-001' AND c.code='FRUIT'
  AND NOT EXISTS (
    SELECT 1 FROM product_category pc WHERE pc.product_id=p.id AND pc.category_id=c.id
);

INSERT INTO product_category(product_id, category_id)
SELECT p.id, c.id
FROM product p, category c
WHERE p.sku='SKU-MILK-001' AND c.code='DAIRY'
  AND NOT EXISTS (
    SELECT 1 FROM product_category pc WHERE pc.product_id=p.id AND pc.category_id=c.id
);

-- Loo/uuenda FOOD
MERGE INTO category c
USING (VALUES ('FOOD','Food')) AS v(code, name)
ON (c.code = v.code)
WHEN MATCHED THEN UPDATE SET name = v.name, is_active = TRUE
WHEN NOT MATCHED THEN INSERT (code, name, is_active) VALUES (v.code, v.name, TRUE);

-- Seo FRUIT ja DAIRY FOOD-i alla (kui olemas)
UPDATE category c
SET parent_id = (SELECT id FROM category WHERE code = 'FOOD')
WHERE c.code IN ('FRUIT','DAIRY');