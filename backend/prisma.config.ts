/**
 * Prisma CLI configuration that declares the schema location and datasource URL.
 */
import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Builds the Prisma config used by generate/migrate commands.
 */
const directUrl = process.env.DIRECT_URL?.trim() || "";
const datasourceUrl = directUrl || process.env.DATABASE_URL?.trim() || "";

if (!datasourceUrl) {
  throw new Error(
    "DATABASE_URL or DIRECT_URL must be set for Prisma. Configure your runtime environment or a local .env."
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: datasourceUrl,
  },
});
