'use strict';

require('dotenv/config');

const fs = require('node:fs');
const path = require('node:path');
const { PrismaClient, Prisma } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const repoRoot = path.resolve(__dirname, '..', '..');
const defaultInputFile = path.join(repoRoot, 'backups', 'production-export.json');
const inputFile = resolveInputFile();
const connectionString = resolveConnectionString();
const options = parseFlags(process.argv.slice(2));

const exportCollections = [
  ['users', 'user'],
  ['categories', 'category'],
  ['products', 'product'],
  ['loyaltyProfiles', 'loyaltyProfile'],
  ['wishlists', 'wishlistItem'],
  ['compareItems', 'compareItem'],
  ['productSpecifications', 'productSpecification'],
  ['productReviews', 'productReview'],
  ['carts', 'cart'],
  ['cartItems', 'cartItem'],
  ['orders', 'order'],
  ['orderItems', 'orderItem'],
];

function resolveInputFile() {
  const positionalFile = process.argv
    .slice(2)
    .find((argument) => argument && !argument.startsWith('--'));

  return positionalFile?.trim() || process.env.PRODUCTION_EXPORT_FILE?.trim() || defaultInputFile;
}

function resolveConnectionString() {
  return process.env.DIRECT_URL?.trim() || process.env.DATABASE_URL?.trim() || '';
}

function parseFlags(argumentsList) {
  return {
    dryRun: argumentsList.includes('--dry-run'),
    forceReset: argumentsList.includes('--force-reset'),
  };
}

function assertFileExists(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Production export file not found: ${filePath}`);
  }
}

function assertConnectionString() {
  if (!connectionString) {
    throw new Error('DIRECT_URL or DATABASE_URL must be set before restoring production data.');
  }
}

function readExport(filePath) {
  const exported = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  for (const [collectionName] of exportCollections) {
    if (!Array.isArray(exported[collectionName])) {
      exported[collectionName] = [];
    }
  }

  return exported;
}

function toDate(value) {
  return value ? new Date(value) : null;
}

function toDecimal(value) {
  return value == null ? null : new Prisma.Decimal(value);
}

function mapUsers(users) {
  return users.map((user) => ({
    ...user,
    createdAt: toDate(user.createdAt),
    updatedAt: toDate(user.updatedAt),
  }));
}

function mapCategories(categories) {
  return categories.map((category) => ({ ...category }));
}

function mapProducts(products) {
  return products.map((product) => ({
    ...product,
    price: toDecimal(product.price),
    createdAt: toDate(product.createdAt),
    updatedAt: toDate(product.updatedAt),
  }));
}

function mapLoyaltyProfiles(loyaltyProfiles) {
  return loyaltyProfiles.map((profile) => ({
    ...profile,
    createdAt: toDate(profile.createdAt),
    updatedAt: toDate(profile.updatedAt),
  }));
}

function mapWishlistItems(items) {
  return items.map((item) => ({
    ...item,
    createdAt: toDate(item.createdAt),
  }));
}

function mapCompareItems(items) {
  return items.map((item) => ({
    ...item,
    createdAt: toDate(item.createdAt),
  }));
}

function mapProductSpecifications(specifications) {
  return specifications.map((specification) => ({
    ...specification,
    createdAt: toDate(specification.createdAt),
    updatedAt: toDate(specification.updatedAt),
  }));
}

function mapProductReviews(reviews) {
  return reviews.map((review) => ({
    ...review,
    createdAt: toDate(review.createdAt),
    updatedAt: toDate(review.updatedAt),
  }));
}

function mapCarts(carts) {
  return carts.map((cart) => ({
    ...cart,
    createdAt: toDate(cart.createdAt),
    updatedAt: toDate(cart.updatedAt),
  }));
}

function mapCartItems(items) {
  return items.map((item) => ({ ...item }));
}

function mapOrders(orders) {
  return orders.map((order) => ({
    ...order,
    total: toDecimal(order.total),
    createdAt: toDate(order.createdAt),
    updatedAt: toDate(order.updatedAt),
  }));
}

function mapOrderItems(items) {
  return items.map((item) => ({
    ...item,
    priceAtPurchase: toDecimal(item.priceAtPurchase),
  }));
}

function buildImportPayload(exported) {
  return {
    users: mapUsers(exported.users),
    categories: mapCategories(exported.categories),
    products: mapProducts(exported.products),
    loyaltyProfiles: mapLoyaltyProfiles(exported.loyaltyProfiles),
    wishlists: mapWishlistItems(exported.wishlists),
    compareItems: mapCompareItems(exported.compareItems),
    productSpecifications: mapProductSpecifications(exported.productSpecifications),
    productReviews: mapProductReviews(exported.productReviews),
    carts: mapCarts(exported.carts),
    cartItems: mapCartItems(exported.cartItems),
    orders: mapOrders(exported.orders),
    orderItems: mapOrderItems(exported.orderItems),
  };
}

function createSummaryFromExport(exported) {
  return Object.fromEntries(
    exportCollections.map(([collectionName]) => [collectionName, exported[collectionName].length])
  );
}

async function getExistingDataSummary(prisma) {
  return {
    users: await prisma.user.count(),
    categories: await prisma.category.count(),
    products: await prisma.product.count(),
    loyaltyProfiles: await prisma.loyaltyProfile.count(),
    wishlists: await prisma.wishlistItem.count(),
    compareItems: await prisma.compareItem.count(),
    productSpecifications: await prisma.productSpecification.count(),
    productReviews: await prisma.productReview.count(),
    carts: await prisma.cart.count(),
    cartItems: await prisma.cartItem.count(),
    orders: await prisma.order.count(),
    orderItems: await prisma.orderItem.count(),
  };
}

function hasExistingData(summary) {
  return Object.values(summary).some((count) => count > 0);
}

async function clearExistingData(prisma) {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productReview.deleteMany();
  await prisma.productSpecification.deleteMany();
  await prisma.compareItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.loyaltyProfile.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
}

async function importData(prisma, payload) {
  await prisma.user.createMany({ data: payload.users });
  await prisma.category.createMany({ data: payload.categories });
  await prisma.product.createMany({ data: payload.products });
  await prisma.loyaltyProfile.createMany({ data: payload.loyaltyProfiles });
  await prisma.wishlistItem.createMany({ data: payload.wishlists });
  await prisma.compareItem.createMany({ data: payload.compareItems });
  await prisma.productSpecification.createMany({ data: payload.productSpecifications });
  await prisma.productReview.createMany({ data: payload.productReviews });
  await prisma.cart.createMany({ data: payload.carts });
  await prisma.cartItem.createMany({ data: payload.cartItems });
  await prisma.order.createMany({ data: payload.orders });
  await prisma.orderItem.createMany({ data: payload.orderItems });
}

function logJson(label, value) {
  console.log(`${label}\n${JSON.stringify(value, null, 2)}`);
}

async function main() {
  assertFileExists(inputFile);

  const exported = readExport(inputFile);
  const payload = buildImportPayload(exported);
  const exportSummary = createSummaryFromExport(exported);

  logJson('[restore-production-export] Backup summary:', exportSummary);

  if (options.dryRun) {
    console.log('[restore-production-export] Dry run completed. No database changes were made.');
    return;
  }

  assertConnectionString();

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const existingSummary = await getExistingDataSummary(prisma);
    logJson('[restore-production-export] Existing database summary:', existingSummary);

    if (hasExistingData(existingSummary) && !options.forceReset) {
      throw new Error(
        'The target database is not empty. Re-run with --force-reset if you want to wipe current data and replace it with the backup.'
      );
    }

    if (options.forceReset) {
      console.log('[restore-production-export] Clearing existing application data before import.');
      await clearExistingData(prisma);
    }

    await importData(prisma, payload);

    const finalSummary = await getExistingDataSummary(prisma);
    logJson('[restore-production-export] Restore completed successfully:', finalSummary);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('[restore-production-export] Failed:', error.message);
  process.exit(1);
});
