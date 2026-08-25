const fs = require("node:fs");
const path = require("node:path");
const { PrismaClient, Prisma } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const repoRoot = path.resolve(__dirname, "..", "..");
const defaultInputFile = path.join(repoRoot, "backups", "production-export.json");
const inputFile = process.argv[2]?.trim() || process.env.PRODUCTION_EXPORT_FILE?.trim() || defaultInputFile;
const connectionString = process.env.DIRECT_URL?.trim() || process.env.DATABASE_URL?.trim() || "";

function assertFileExists(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Production export file not found: ${filePath}`);
  }
}

function assertConnectionString() {
  if (!connectionString) {
    throw new Error("DIRECT_URL or DATABASE_URL must be set before importing production data.");
  }
}

function readExport(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
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

async function main() {
  assertFileExists(inputFile);
  assertConnectionString();

  const exported = readExport(inputFile);
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    await clearExistingData(prisma);

    await prisma.user.createMany({ data: mapUsers(exported.users || []) });
    await prisma.category.createMany({ data: mapCategories(exported.categories || []) });
    await prisma.product.createMany({ data: mapProducts(exported.products || []) });
    await prisma.loyaltyProfile.createMany({ data: mapLoyaltyProfiles(exported.loyaltyProfiles || []) });
    await prisma.wishlistItem.createMany({ data: mapWishlistItems(exported.wishlists || []) });
    await prisma.compareItem.createMany({ data: mapCompareItems(exported.compareItems || []) });
    await prisma.productSpecification.createMany({
      data: mapProductSpecifications(exported.productSpecifications || []),
    });
    await prisma.productReview.createMany({ data: mapProductReviews(exported.productReviews || []) });
    await prisma.cart.createMany({ data: mapCarts(exported.carts || []) });
    await prisma.cartItem.createMany({ data: mapCartItems(exported.cartItems || []) });
    await prisma.order.createMany({ data: mapOrders(exported.orders || []) });
    await prisma.orderItem.createMany({ data: mapOrderItems(exported.orderItems || []) });

    const summary = {
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

    console.log(JSON.stringify(summary, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("[import-production-export] Failed:", error.message);
  process.exit(1);
});
