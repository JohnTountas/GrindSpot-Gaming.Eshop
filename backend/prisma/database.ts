/**
 * TypeScript database script that creates baseline users, categories, and products.
 * Environment controls:
 * - AUTO_SEED=true runs this script from the container entrypoint when products are missing.
 * - SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD create a production-safe admin account.
 * - SEED_USER_EMAIL / SEED_USER_PASSWORD optionally create a demo customer account.
 * - SEED_RESET=true clears catalog-related data before reseeding.
 * - SEED_RESET_USERS=true also deletes users during a reset run.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  }),
});

// Controls how many products each category should receive during seeding.
const TARGET_PRODUCTS_PER_CATEGORY = 10;

// Defines the seedable product data shape.
type DatabaseProduct = {
  title: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
};

// Enumerates category slugs used by seed data.
type CategorySlang = "Gaming-desktop-pc" | "Keyboards" | "Mouse" | "Headsets" | "Monitors";

// Maps category slugs to their seeded products.
type ProductsByCategory = Record<CategorySlang, DatabaseProduct[]>;

// Represents a specification row used in seeding.
type SeedSpecification = {
  label: string;
  value: string;
  position: number;
};

// Represents a review row used in seeding.
type SeedReview = {
  authorName: string;
  title: string;
  comment: string;
  rating: number;
  verifiedPurchase: boolean;
};

// Enumerates supported seed user roles.
type SeedUserRole = "ADMIN" | "USER";

// Describes the environment-driven seed user input.
type SeedUserDefinition = {
  emailEnvKey: string;
  passwordEnvKey: string;
  role: SeedUserRole;
  firstName: string;
  lastName: string;
  loyaltyXp: number;
  loyaltyLevel: number;
};

// Validates seeded products are unique and complete for each category.
function validateUniqueProducts(slang: CategorySlang, products: DatabaseProduct[]) {
  if (products.length !== TARGET_PRODUCTS_PER_CATEGORY) {
    throw new Error(
      `Category ${slang} has ${products.length} products instead of ${TARGET_PRODUCTS_PER_CATEGORY}`
    );
  }

  const titles = new Set<string>();
  const descriptions = new Set<string>();
  const prices = new Set<number>();
  const primaryImages = new Set<string>();

  for (const product of products) {
    if (titles.has(product.title)) {
      throw new Error(`Duplicate title in ${slang}: ${product.title}`);
    }
    titles.add(product.title);

    if (descriptions.has(product.description)) {
      throw new Error(`Duplicate description in ${slang}: ${product.title}`);
    }
    descriptions.add(product.description);

    if (prices.has(product.price)) {
      throw new Error(`Duplicate price in ${slang}: ${product.title}`);
    }
    prices.add(product.price);

    const primaryImage = product.images[0] ?? "";
    if (!primaryImage) {
      throw new Error(`Missing primary image in ${slang}: ${product.title}`);
    }
    if (primaryImages.has(primaryImage)) {
      throw new Error(`Duplicate primary image in ${slang}: ${product.title}`);
    }
    primaryImages.add(primaryImage);
  }
}

// Builds fallback specification rows for seeded catalog products.
function buildSeedSpecifications(categorySlang: string, title: string): SeedSpecification[] {
  if (categorySlang === "Gaming-desktop-pc") {
    return [
      { label: "CPU", value: "Ryzen 9 / Intel Core i9 Class", position: 0 },
      { label: "GPU", value: "RTX 50 / RX 8000 Series Class", position: 1 },
      { label: "Memory", value: "32GB DDR5", position: 2 },
      { label: "Storage", value: "2TB NVMe SSD", position: 3 },
      { label: "Cooling", value: "Advanced thermal airflow", position: 4 },
      { label: "Warranty", value: `36-month premium support for ${title}`, position: 5 },
    ];
  }

  if (categorySlang === "Monitors") {
    return [
      { label: "Panel Type", value: "Fast IPS / OLED Class", position: 0 },
      { label: "Resolution", value: "QHD to 4K", position: 1 },
      { label: "Refresh Rate", value: "165Hz to 360Hz", position: 2 },
      { label: "Response Time", value: "0.03ms to 1ms", position: 3 },
      { label: "Sync", value: "FreeSync Premium & G-SYNC Compatible", position: 4 },
      { label: "Ports", value: "HDMI 2.1 / DisplayPort / USB-C", position: 5 },
    ];
  }

  if (categorySlang === "Keyboards") {
    return [
      { label: "Switch Type", value: "Mechanical / Hall-effect", position: 0 },
      { label: "Layout", value: "60% / 75% / TKL", position: 1 },
      { label: "Polling Rate", value: "1000Hz to 8000Hz", position: 2 },
      { label: "Connectivity", value: "USB-C / 2.4GHz / Bluetooth", position: 3 },
      { label: "Keycaps", value: "Double-shot PBT", position: 4 },
      { label: "Software", value: "Macro and RGB profile support", position: 5 },
    ];
  }

  if (categorySlang === "Mouse") {
    return [
      { label: "Sensor", value: "High-precision optical sensor", position: 0 },
      { label: "Max DPI", value: "26,000 to 36,000 DPI", position: 1 },
      { label: "Weight", value: "54g to 78g", position: 2 },
      { label: "Polling Rate", value: "1000Hz to 8000Hz", position: 3 },
      { label: "Switches", value: "Optical, 90M+ lifecycle", position: 4 },
      { label: "Connectivity", value: "Wired / Wireless 2.4GHz", position: 5 },
    ];
  }

  return [
    { label: "Driver", value: "40mm to 53mm dynamic drivers", position: 0 },
    { label: "Microphone", value: "Detachable cardioid boom", position: 1 },
    { label: "Audio", value: "Stereo / Virtual 7.1 surround", position: 2 },
    { label: "Battery", value: "40 to 70 hours wireless runtime", position: 3 },
    { label: "Connection", value: "USB-C / 2.4GHz / Bluetooth", position: 4 },
    { label: "Comfort", value: "Low-pressure ergonomic headband", position: 5 },
  ];
}

// Builds review snapshots used during database seeding.
function buildSeedReviews(title: string): SeedReview[] {
  return [
    {
      authorName: "Alex R.",
      title: `Excellent performance from ${title}`,
      comment:
        "Performance is consistent under load, quality feels premium, and delivery was very fast.",
      rating: 5,
      verifiedPurchase: true,
    },
    {
      authorName: "Mary L.",
      title: "Great value for serious players",
      comment:
        "Setup was straightforward and stability has been excellent during long competitive sessions.",
      rating: 4,
      verifiedPurchase: true,
    },
    {
      authorName: "Steve T.",
      title: "Reliable daily driver",
      comment:
        "Solid build and dependable experience. Packaging and customer support were both professional.",
      rating: 4,
      verifiedPurchase: false,
    },
  ];
}

// Reads a trimmed environment variable and normalizes empty strings to null.
function getOptionalEnvValue(key: string): string | null {
  const value = process.env[key]?.trim();
  return value ? value : null;
}

// Creates or updates an optional seed user when both email and password are provided.
async function upsertSeedUser(definition: SeedUserDefinition): Promise<string | null> {
  const email = getOptionalEnvValue(definition.emailEnvKey);
  const password = getOptionalEnvValue(definition.passwordEnvKey);

  if (!email || !password) {
    return null;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: definition.role,
      firstName: definition.firstName,
      lastName: definition.lastName,
    },
    create: {
      email,
      passwordHash,
      role: definition.role,
      firstName: definition.firstName,
      lastName: definition.lastName,
    },
  });

  await prisma.loyaltyProfile.upsert({
    where: { userId: user.id },
    update: {
      xp: definition.loyaltyXp,
      level: definition.loyaltyLevel,
    },
    create: {
      userId: user.id,
      xp: definition.loyaltyXp,
      level: definition.loyaltyLevel,
    },
  });

  console.log(`${definition.role} user seeded: ${user.email}`);
  return user.email;
}

// Seeds optional admin and demo users from environment variables.
async function seedConfiguredUsers(): Promise<string[]> {
  const seededUsers = await Promise.all([
    upsertSeedUser({
      emailEnvKey: "SEED_ADMIN_EMAIL",
      passwordEnvKey: "SEED_ADMIN_PASSWORD",
      role: "ADMIN",
      firstName: "Admin",
      lastName: "User",
      loyaltyXp: 2400,
      loyaltyLevel: 11,
    }),
    upsertSeedUser({
      emailEnvKey: "SEED_USER_EMAIL",
      passwordEnvKey: "SEED_USER_PASSWORD",
      role: "USER",
      firstName: "Demo",
      lastName: "User",
      loyaltyXp: 420,
      loyaltyLevel: 2,
    }),
  ]);

  const seededEmails = seededUsers.filter((email): email is string => Boolean(email));

  if (seededEmails.length === 0) {
    console.log("No seed-user credentials provided. Skipping user seeding.");
  }

  return seededEmails;
}

// Clears existing data when an explicit reset seed run is requested.
async function resetSeedData(db: any): Promise<void> {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await db.productReview.deleteMany();
  await db.productSpecification.deleteMany();
  await db.compareItem.deleteMany();
  await db.wishlistItem.deleteMany();
  await db.loyaltyProfile.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  if (process.env.SEED_RESET_USERS === "true") {
    await prisma.user.deleteMany();
    console.log("Existing users deleted because SEED_RESET_USERS=true.");
  }
}

// Runs the Prisma seed workflow to reset and repopulate catalog data.
async function main() {
  console.log("Starting database ...");
  const db = prisma as any;
  const shouldResetData = process.env.SEED_RESET === "true";

  if (shouldResetData) {
    console.log("SEED_RESET=true. Clearing existing catalog data before seeding.");
    await resetSeedData(db);
  }

  const seededUserEmails = await seedConfiguredUsers();

  const existingProductCount = await prisma.product.count();
  if (existingProductCount > 0) {
    console.log(
      `Catalog already exists (products: ${existingProductCount}). Skipping product seed.`
    );
    return;
  }

  // Phase 1: create category taxonomy used by catalog and filtering APIs.
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slang: "Gaming-desktop-pc" },
      update: { name: "Gaming Desktop PC" },
      create: { name: "Gaming Desktop PC", slang: "Gaming-desktop-pc" },
    }),
    prisma.category.upsert({
      where: { slang: "Keyboards" },
      update: { name: "Keyboards" },
      create: { name: "Keyboards", slang: "Keyboards" },
    }),
    prisma.category.upsert({
      where: { slang: "Mouse" },
      update: { name: "Mouse" },
      create: { name: "Mouse", slang: "Mouse" },
    }),
    prisma.category.upsert({
      where: { slang: "Headsets" },
      update: { name: "Headsets" },
      create: { name: "Headsets", slang: "Headsets" },
    }),
    prisma.category.upsert({
      where: { slang: "Monitors" },
      update: { name: "Monitors" },
      create: { name: "Monitors", slang: "Monitors" },
    }),
  ]);
  console.log("\nCategories ready:", categories.length);

  const productsByCategory: ProductsByCategory = {
    "Gaming-desktop-pc": [
      {
        title: "Vengeance Rogue-V57 MSI Edition.jpg",
        description:
          "High-end gaming desktop built with an RTX 5080, liquid-cooled Intel processor, and tuned airflow chassis for consistent 4K frame delivery under sustained load.",
        price: 2899.0,
        images: ["/product-images/gaming_pc/vengeance rogue-v57 msi edition.jpg"],
        stock: 12,
      },
      {
        title: "Vengeance Rogue-V57 MSI Edition",
        description:
          "Performance-first AMD platform with Radeon RX 8900 XT graphics, DDR5 memory, and precision thermal zoning for stable QHD gaming and content creation workloads.",
        price: 2499.0,
        images: ["/product-images/gaming_pc/vengeance rogue-v57 msi edition gaming.jpeg"],
        stock: 15,
      },
      {
        title: "Be-Quiet PURE XT567",
        description:
          "Compact Mini-ITX desktop engineered for small spaces, featuring premium cable routing, efficient cooling, and high-refresh 1440p capability in a reduced footprint.",
        price: 1999.0,
        images: ["/product-images/gaming_pc/be-quiet pure xt567-gaming pc.jpeg"],
        stock: 15,
      },
      {
        title: "Cooler Master XM-453F",
        description:
          "Flagship tower configured for ultra settings at 4K, with next-generation CPU scheduling, high-capacity SSD storage, and reinforced power delivery for long gaming sessions.",
        price: 3299.0,
        images: ["/product-images/gaming_pc/cooler-master xm-453f.jpg"],
        stock: 9,
      },
      {
        title: "Vengeance GhostOps-V18",
        description:
          "Tournament-ready system optimized for low latency and high frame consistency, pairing fast single-core performance with a responsive GPU pipeline for esports titles.",
        price: 1799.0,
        images: ["/product-images/gaming_pc/vengeance ghost_ops-v18.jpg"],
        stock: 21,
      },
      {
        title: "Corsair H923i",
        description:
          "Dual-purpose workstation for gaming and production, equipped with custom liquid cooling, multicore acceleration, and quiet acoustics for demanding rendering projects.",
        price: 1899.0,
        images: ["/product-images/gaming_pc/Corsair H923i gaming pc.png"],
        stock: 7,
      },
      {
        title: "Vengeance Roanok V3 MSI",
        description:
          "Matte-black chassis with noise-damped panels, high-efficiency fans, and balanced hardware selection for silent high-fidelity gaming in shared office environments.",
        price: 1269.0,
        images: ["/product-images/gaming_pc/vengeance_roanok_v3.jpeg"],
        stock: 8,
      },
      {
        title: "Corsair X535 Ultimate",
        description:
          "Streaming-focused build combining hardware AV1 encoding, multithreaded compute headroom, and dedicated capture support for simultaneous gameplay and broadcast output.",
        price: 2699.0,
        images: ["/product-images/gaming_pc/corsair x535 ultimate.jpg"],
        stock: 11,
      },
      {
        title: "Cooler Master - Spring 2025",
        description:
          "High-clock esports desktop tuned for 240FPS targets, featuring low-latency memory profiles and fast NVMe loading to reduce startup and map transition delays.",
        price: 1389.0,
        images: ["/product-images/gaming_pc/cooler master_spring 2022.png"],
        stock: 17,
      },
      {
        title: "Vengeance Fury-K9 NZXT Edition",
        description:
          "Cube-format gaming desktop with reinforced airflow channels, premium motherboard layout, and tool-free access for rapid upgrades and maintenance.",
        price: 1299.0,
        images: ["/product-images/gaming_pc/vengeance fury-k9.jpeg"],
        stock: 19,
      },
    ],
    Keyboards: [
      {
        title: "Keychron Q1H-M1 - Wireless",
        description:
          "Premium 75 percent keyboard with magnetic hall-effect switches, adjustable actuation points, and CNC aluminum frame engineered for competitive response times.",
        price: 239.0,
        images: ["/product-images/keyboards/Keychron Q1H-M1 HE QMK Wireless.jpeg"],
        stock: 44,
      },
      {
        title: "Corsair K55 RGB Pro",
        description:
          "Tenkeyless mechanical model with gasket mount architecture, pre-lubed stabilizers, and durable PBT keycaps delivering refined acoustics for daily typing.",
        price: 149.0,
        images: ["/product-images/keyboards/Corsair K55 RGB Pro Gaming.jpeg"],
        stock: 52,
      },
      {
        title: "Corsair Vanguard Pro 96",
        description:
          "Ninety-eight key wireless keyboard supporting tri-mode connectivity, hot-swap sockets, and long-life battery tuned for office and gaming crossover use.",
        price: 189.0,
        images: ["/product-images/keyboards/Corsair Vanguard Pro 96 Ηall Effect Gaming.jpeg"],
        stock: 37,
      },
      {
        title: "Keychron C3 Pro C3P-A3 Gaming",
        description:
          "Full-layout RGB keyboard with dedicated media keys, per-key lighting effects, and reinforced plate construction for consistent switch feel.",
        price: 129.0,
        images: ["/product-images/keyboards/Keychron C3 Pro C3P-A3 Gaming.jpeg"],
        stock: 61,
      },
      {
        title: "Keychron K2 HE Wireless Gaming",
        description:
          "Sixty-five percent aluminum keyboard with compact arrow cluster, dampened internal layers, and programmable layers for streamlined workflows.",
        price: 169.0,
        images: ["/product-images/keyboards/Keychron K2 HE Wireless Gaming.jpeg"],
        stock: 46,
      },
      {
        title: "Logitech G915 X Lightspeed Wireless Gaming",
        description:
          "Split-layout ergonomic keyboard designed to reduce wrist strain, featuring adjustable tenting, columnar key placement, and advanced macro mapping.",
        price: 219.0,
        images: ["/product-images/keyboards/Logitech G915 X Lightspeed Wireless Gaming.jpeg"],
        stock: 28,
      },
      {
        title: "Logitech Pro X TKL Rapid Gaming",
        description:
          "Ninety-six percent hot-swap keyboard offering near full-size functionality, dual dampening foam, and low-latency wireless performance.",
        price: 159.0,
        images: ["/product-images/keyboards/Logitech Pro X TKL Rapid Gaming.jpeg"],
        stock: 49,
      },
      {
        title: "Razer BlackWidow V3 Gaming",
        description:
          "Hall-effect TKL platform with analog-style key detection, rapid trigger functionality, and premium software tuning for tactical gaming input.",
        price: 199.0,
        images: ["/product-images/keyboards/Razer BlackWidow V3 Gaming.jpeg"],
        stock: 33,
      },
      {
        title: "Razer Huntsman V3 Pro Mini Analog Gaming",
        description:
          "Ultra-compact sixty percent keyboard built for portability, featuring layered commands, detachable USB-C cable, and durable double-shot legends.",
        price: 139.0,
        images: ["/product-images/keyboards/Razer Huntsman V3 Pro Mini Analog Gaming.jpeg"],
        stock: 58,
      },
      {
        title: "Keychron C2 Pro - C2PX-M3",
        description:
          "Low-profile keyboard with short-travel mechanical switches, quiet key acoustics, and high-precision stabilizers tailored for professional desks.",
        price: 179.0,
        images: ["/product-images/keyboards/Keychron_C2_Pro_C2PX-M3.jpeg"],
        stock: 42,
      },
    ],
    Mouse: [
      {
        title: "Corsair Harpoon RGB Pro Gaming",
        description:
          "Professional gaming mouse with 8K polling, flagship optical sensor, and tuned click latency for precise tracking in high-intensity play.",
        price: 119.0,
        images: ["/product-images/mouse/Corsair Harpoon RGB Pro Gaming.jpeg"],
        stock: 56,
      },
      {
        title: "Corsair M75 RGB Gaming_26000 DPI",
        description:
          "Ergonomic wireless mouse shaped for all-day comfort, with sculpted thumb rest, stable tracking engine, and long battery endurance.",
        price: 89.0,
        images: ["/product-images/mouse/Corsair M75 RGB Gaming_26000 DPI.jpeg"],
        stock: 63,
      },
      {
        title: "Corsair M75 Wireless RGB Gaming",
        description:
          "Sub-60 gram FPS-focused mouse featuring low-friction skates, flexible cable, and optimized sensor lift-off distance for controlled flick aiming.",
        price: 99.0,
        images: ["/product-images/mouse/Corsair M75 Wireless RGB Gaming.jpeg"],
        stock: 48,
      },
      {
        title: "Corsair Scimitar RGB Elite Gaming",
        description:
          "High-button-count MMO mouse with programmable side grid, onboard profile storage, and durable switches for complex ability rotations.",
        price: 129.0,
        images: ["/product-images/mouse/Corsair Scimitar RGB Elite Gaming .jpeg"],
        stock: 31,
      },
      {
        title: "Logitech G903 Lightspeed (Hero) Wireless",
        description:
          "Quiet-click office mouse built for shared spaces, combining accurate tracking, silent wheel mechanics, and polished multi-surface glide.",
        price: 49.0,
        images: ["/product-images/mouse/Logitech G903 Lightspeed (Hero) Wireless.jpeg"],
        stock: 82,
      },
      {
        title: "Logitech G Pro 2 Lightspeed Wireless",
        description:
          "Vertical ergonomic mouse engineered to reduce forearm pronation, with smooth cursor control and extended comfort for repetitive workflows.",
        price: 79.0,
        images: ["/product-images/mouse/Logitech G Pro 2 Lightspeed Wireless.jpeg"],
        stock: 45,
      },
      {
        title: "HyperX Pulsefire Haste 2 Wireless_16000 DPI Black",
        description:
          "Compact Bluetooth travel mouse with dual-device pairing, reliable optical tracking, and collapsible form factor for mobile setups.",
        price: 59.0,
        images: ["/product-images/mouse/HyperX Pulsefire Haste 2 Wireless_16000 DPI Black.jpeg"],
        stock: 71,
      },
      {
        title: "Logitech G502 Hero RGB",
        description:
          "Hybrid gaming mouse with interchangeable side grips, adjustable sensor calibration, and tuned weight distribution for control-oriented players.",
        price: 109.0,
        images: ["/product-images/mouse/Logitech G502 Hero RGB Gaming.jpeg"],
        stock: 38,
      },
      {
        title: "Razer Basilisk V3 Pro 35K",
        description:
          "Ultra-portable wireless mouse designed for compact bags, delivering dependable precision and fast wake response after standby.",
        price: 39.0,
        images: ["/product-images/mouse/Razer Basilisk V3 Pro 35K.jpeg"],
        stock: 94,
      },
      {
        title: "Razer Viper V3 Pro Wireless_35000 DPI",
        description:
          "Performance gaming mouse with dynamic RGB zones, premium optical engine, and tactile switch feel optimized for rapid input.",
        price: 94.0,
        images: [
          "/product-images/mouse/Razer Viper V3 Pro Wireless_35000 DPI Sentinels Edition.jpeg",
        ],
        stock: 50,
      },
    ],
    Headsets: [
      {
        title: "Corsair HS80 RGB Over Ear Gaming Headset",
        description:
          "Premium wireless headset with low-latency 2.4GHz link, broadcast-grade detachable microphone, and deep memory foam comfort for long sessions.",
        price: 219.0,
        images: ["/product-images/headsets/Corsair HS80 RGB Over Ear Gaming Headset.jpeg"],
        stock: 29,
      },
      {
        title: "HyperX Cloud II Over Ear Gaming Headset",
        description:
          "Virtual 7.1 gaming headset engineered for positional awareness, featuring tuned drivers and a clear boom mic for team communication.",
        price: 169.0,
        images: ["/product-images/headsets/HyperX Cloud II Over Ear Gaming Headset.jpeg"],
        stock: 41,
      },
      {
        title: "HyperX Cloud Stinger Gaming Headset",
        description:
          "Hybrid-use headset with active noise cancellation, Bluetooth plus wired connectivity, and balanced audio profile for work and play.",
        price: 189.0,
        images: ["/product-images/headsets/HyperX Cloud Stinger Over Ear Gaming Headset .jpeg"],
        stock: 34,
      },
      {
        title: "HyperX CloudX Stinger II for Playstation Over",
        description:
          "Studio-inspired headset with wide soundstage tuning, high-sensitivity microphone capsule, and robust frame construction for daily use.",
        price: 159.0,
        images: ["/product-images/headsets/HyperX CloudX Stinger II for Playstation Over.jpeg"],
        stock: 37,
      },
      {
        title: "Logitech G432 7.1 Over Ear Gaming Headset",
        description:
          "Lightweight wireless headset delivering extended battery life, low-pressure headband design, and dependable voice clarity for marathon gaming nights.",
        price: 149.0,
        images: ["/product-images/headsets/Logitech G432 7.1 Over Ear Gaming Headset.jpeg"],
        stock: 46,
      },
      {
        title: "Logitech G733 wireless Over Ear Gaming Headset",
        description:
          "Content-creator headset with enhanced microphone processing, neutral sound signature, and reinforced hinges for streaming studios.",
        price: 199.0,
        images: ["/product-images/headsets/Logitech G733 wireless Over Ear Gaming Headset .jpeg"],
        stock: 25,
      },
      {
        title: "Razer Blackshark V2 X for Xbox Over Ear",
        description:
          "Closed-back acoustic design providing passive isolation, focused bass response, and reliable speech pickup in noisy environments.",
        price: 139.0,
        images: ["/product-images/headsets/Razer Blackshark V2 X for Xbox Over Ear.jpeg"],
        stock: 53,
      },
      {
        title: "Razer Kraken V4 Pro & Sound Card",
        description:
          "Open-acoustic headset for natural spatial imaging, breathable ear cushions, and balanced tuning suited to immersive single-player titles.",
        price: 129.0,
        images: ["/product-images/headsets/Razer Kraken V4 Pro & Sound Card.jpeg"],
        stock: 31,
      },
      {
        title: "Razer Kraken V4 X Over Ear Gaming Headset",
        description:
          "Dual-mode headset supporting USB and wireless operation, equipped with low-noise microphone circuitry and detailed midrange presentation.",
        price: 179.0,
        images: ["/product-images/headsets/Razer Kraken V4 X Over Ear Gaming Headset.jpeg"],
        stock: 39,
      },
      {
        title: "SteelSeries Arctis Nova 5 Over Ear Gaming Headset",
        description:
          "Tournament-grade headset with ultra-low latency pipeline, directional cue enhancement, and secure clamping force for stable fit.",
        price: 209.0,
        images: ["/product-images/headsets/SteelSeries Arctis Nova 5 Over Ear Gaming Headset.jpeg"],
        stock: 22,
      },
    ],
    Monitors: [
      {
        title: "Samsung Odyssey Neo G8 S32BG850 VA",
        description:
          "Twenty-seven inch QHD gaming monitor with 240Hz refresh, rapid pixel response, and adaptive sync for fluid competitive motion.",
        price: 549.0,
        images: ["/product-images/monitors/Samsung Odyssey Neo G8 S32BG850 VA.jpeg"],
        stock: 33,
      },
      {
        title: "Dell Alienware AW2523HF IPS Gaming Monitor 24.5",
        description:
          "Thirty-four inch ultrawide display with expansive aspect ratio, high contrast panel, and multitasking-friendly workspace for gaming and production.",
        price: 899.0,
        images: ["/product-images/monitors/Dell Alienware AW2523HF IPS Gaming Monitor 24.5.jpeg"],
        stock: 18,
      },
      {
        title: "Dell G2524H IPS Gaming Monitor 24.5",
        description:
          "Thirty-two inch 4K IPS monitor offering excellent color consistency, fine detail rendering, and ergonomic adjustment for prolonged sessions.",
        price: 699.0,
        images: ["/product-images/monitors/Dell G2524H IPS Gaming Monitor 24.5.jpeg"],
        stock: 24,
      },
      {
        title: "LG 32UQ750P-W VA HDR Gaming Monitor 31.5",
        description:
          "Fast-twitch esports monitor with 360Hz refresh and low processing delay, engineered to preserve clarity during extreme motion changes.",
        price: 629.0,
        images: ["/product-images/monitors/LG 32UQ750P-W VA HDR Gaming Monitor 31.5.jpeg"],
        stock: 20,
      },
      {
        title: "LG UltraGear 24GQ50F-B VA Gaming Monitor 24",
        description:
          "Mini-LED HDR monitor with local dimming zones, high peak brightness, and wide color gamut for immersive high-fidelity visuals.",
        price: 1099.0,
        images: ["/product-images/monitors/LG UltraGear 24GQ50F-B VA Gaming Monitor 24.jpeg"],
        stock: 12,
      },
      {
        title: "MSI G244F E2 IPS Gaming Monitor 23.8",
        description:
          "Forty-nine inch dual-QHD superwide monitor designed for simulation games and productivity, providing panoramic viewing without bezel interruption.",
        price: 1299.0,
        images: ["/product-images/monitors/MSI G244F E2 IPS Gaming Monitor 23.8.jpeg"],
        stock: 9,
      },
      {
        title: "MSI MAG 27C6X VA HDR Curved Gaming Monitor 27.",
        description:
          "Value-oriented twenty-four inch gaming monitor featuring high refresh support, low input lag, and dependable image sharpness for 1080p play.",
        price: 249.0,
        images: ["/product-images/monitors/MSI MAG 27C6X VA HDR Curved Gaming Monitor 27.jpeg"],
        stock: 41,
      },
      {
        title: "Samsung Odyssey G4 IPS Gaming Monitor 27",
        description:
          "Creator-focused display calibrated for color-critical workflows, with factory profiling and uniform backlight for dependable visual consistency.",
        price: 749.0,
        images: ["/product-images/monitors/Samsung Odyssey G4 IPS Gaming Monitor 27.jpeg"],
        stock: 16,
      },
      {
        title: "Xiaomi G Pro 27i IPS HDR Gaming Monitor 27",
        description:
          "Thirty-two inch curved monitor pairing immersive radius design with 165Hz refresh to balance cinematic visuals and smooth gameplay.",
        price: 479.0,
        images: ["/product-images/monitors/Xiaomi G Pro 27i IPS HDR Gaming Monitor 27.jpeg"],
        stock: 27,
      },
      {
        title: "Xiaomi G34WQi Ultrawide VA Curved Gaming Monitor 34",
        description:
          "OLED gaming monitor delivering deep contrast, ultra-fast response, and vivid color reproduction for premium single-player and esports experiences.",
        price: 999.0,
        images: [
          "/product-images/monitors/Xiaomi G34WQi Ultrawide VA Curved Gaming Monitor 34.jpeg",
        ],
        stock: 11,
      },
    ],
  };

  for (const slang of Object.keys(productsByCategory) as CategorySlang[]) {
    // Guard against accidental over-seeding when product arrays are edited.
    productsByCategory[slang] = productsByCategory[slang].slice(0, TARGET_PRODUCTS_PER_CATEGORY);
  }

  // Validate category-level seed integrity before writing data to the database.
  for (const [slang, products] of Object.entries(productsByCategory) as Array<
    [CategorySlang, DatabaseProduct[]]
  >) {
    validateUniqueProducts(slang, products);
  }

  const categoryBySlang: Record<string, string> = Object.fromEntries(
    categories.map((category: (typeof categories)[number]) => [category.slang, category.id])
  );

  // Flatten category buckets into createMany input with resolved foreign keys.
  const products = (
    Object.entries(productsByCategory) as Array<[CategorySlang, DatabaseProduct[]]>
  ).flatMap(([slang, categoryProducts]) => {
    const categoryId = categoryBySlang[slang];
    if (!categoryId) {
      throw new Error(`Missing fill category for slang: ${slang}`);
    }

    return categoryProducts.map((product) => ({
      ...product,
      categoryId,
    }));
  });

  const productCountsByCategory = products.reduce<Record<string, number>>((acc, product) => {
    acc[product.categoryId] = (acc[product.categoryId] ?? 0) + 1;
    return acc;
  }, {});

  for (const category of categories) {
    const count = productCountsByCategory[category.id] ?? 0;
    if (count !== TARGET_PRODUCTS_PER_CATEGORY) {
      throw new Error(
        `Invalid product count for ${category.slang}: expected ${TARGET_PRODUCTS_PER_CATEGORY}, got ${count}`
      );
    }
  }

  await prisma.product.createMany({ data: products });
  console.log("Products created:", products.length);
  console.log(`Products per category: ${TARGET_PRODUCTS_PER_CATEGORY}`);

  // Reload product IDs to build relational seed rows for specs and reviews.
  const createdProducts = await prisma.product.findMany({
    include: {
      category: true,
    },
  });

  const specifications = createdProducts.flatMap((product) =>
    buildSeedSpecifications(product.category.slang, product.title).map((specification) => ({
      productId: product.id,
      label: specification.label,
      value: specification.value,
      position: specification.position,
    }))
  );

  const reviews = createdProducts.flatMap((product) =>
    buildSeedReviews(product.title).map((review) => ({
      productId: product.id,
      authorName: review.authorName,
      title: review.title,
      comment: review.comment,
      rating: review.rating,
      verifiedPurchase: review.verifiedPurchase,
    }))
  );

  await db.productSpecification.createMany({ data: specifications });
  await db.productReview.createMany({ data: reviews });
  console.log("Product specifications created:", specifications.length);
  console.log("Product reviews created:", reviews.length);

  console.log("\nDatabase started successfully !");

  if (seededUserEmails.length > 0) {
    console.log("\nSeeded user accounts:");
    seededUserEmails.forEach((email) => {
      console.log(`- ${email}`);
    });
  }
}

main()
  .catch((error) => {
    console.error("Database script failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
