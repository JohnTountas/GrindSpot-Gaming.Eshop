-- Correct the existing Gaming Desktop PC catalog row that was previously seeded
-- as Be-Quiet F-7500 so Fly deployments update the live database as well.
WITH target_products AS (
    SELECT "id"
    FROM "Product"
    WHERE "categoryId" IN (
        SELECT "id"
        FROM "Category"
        WHERE "slang" = 'Gaming-desktop-pc'
    )
    AND (
        "title" = 'Be-Quiet F-7500 '
        OR "title" = 'Vengeance Roanok V3 MSI'
        OR "images" @> ARRAY['/product-images/gaming_pc/be-quiet a7500 gaming.png']::TEXT[]
        OR "images" @> ARRAY['/product-images/gaming_pc/vengeance_roanok_v3.jpeg']::TEXT[]
    )
)
UPDATE "Product"
SET
    "title" = 'Vengeance Roanok V3 MSI',
    "description" = 'Matte-black chassis with noise-damped panels, high-efficiency fans, and balanced hardware selection for silent high-fidelity gaming in shared office environments.',
    "price" = 1269.00,
    "images" = ARRAY['/product-images/gaming_pc/vengeance_roanok_v3.jpeg']::TEXT[],
    "stock" = 8,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" IN (SELECT "id" FROM target_products);

UPDATE "ProductSpecification"
SET
    "value" = '36-month premium support for Vengeance Roanok V3 MSI',
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "label" = 'Warranty'
  AND "productId" IN (
      SELECT "id"
      FROM "Product"
      WHERE "title" = 'Vengeance Roanok V3 MSI'
        AND "images" @> ARRAY['/product-images/gaming_pc/vengeance_roanok_v3.jpeg']::TEXT[]
  );

UPDATE "ProductReview"
SET
    "title" = 'Excellent performance from Vengeance Roanok V3 MSI',
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "title" = 'Excellent performance from Be-Quiet F-7500 '
  AND "productId" IN (
      SELECT "id"
      FROM "Product"
      WHERE "title" = 'Vengeance Roanok V3 MSI'
        AND "images" @> ARRAY['/product-images/gaming_pc/vengeance_roanok_v3.jpeg']::TEXT[]
  );
