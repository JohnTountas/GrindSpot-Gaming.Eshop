/**
 * Exports a shared Prisma client instance for database access across modules.
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from './env';

/**
 * Shared Prisma client with environment-specific logging.
 */
const prisma = new PrismaClient({
  // `PrismaPg` keeps Prisma on the same connection contract as the Node runtime
  // instead of layering provider-specific behavior elsewhere.
  adapter: new PrismaPg({ connectionString: config.databaseUrl }),
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export default prisma;
