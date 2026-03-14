import type { Express } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import productRoutes from '../modules/products/product.routes';
import cartRoutes from '../modules/cart/cart.routes';
import orderRoutes, { adminRouter as adminOrderRoutes } from '../modules/orders/order.routes';
import categoryRoutes from '../modules/categories/category.routes';
import storefrontRoutes from '../modules/storefront/storefront.routes';
import adminCatalogRoutes from '../modules/adminCatalog/adminCatalog.routes';

// Keep route registration flat and explicit here. It makes the public surface
// area easy to audit without hunting through bootstrap code.
export function registerApiFeatureRoutes(expressApplication: Express, apiBasePath: string): void {
  expressApplication.use(`${apiBasePath}/auth`, authRoutes);
  expressApplication.use(`${apiBasePath}/products`, productRoutes);
  expressApplication.use(`${apiBasePath}/cart`, cartRoutes);
  expressApplication.use(`${apiBasePath}/orders`, orderRoutes);
  expressApplication.use(`${apiBasePath}/admin/orders`, adminOrderRoutes);
  expressApplication.use(`${apiBasePath}/admin/catalog`, adminCatalogRoutes);
  expressApplication.use(`${apiBasePath}/categories`, categoryRoutes);
  expressApplication.use(`${apiBasePath}/me`, storefrontRoutes);
}
