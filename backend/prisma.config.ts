/**
 * Prisma CLI configuration that declares the schema location and datasource URL.
 */
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/**
 * Builds the Prisma config used by generate/migrate commands.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
