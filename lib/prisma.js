import { PrismaClient } from '@prisma/client';

const globalForPrisma = typeof globalThis !== 'undefined' ? globalThis : global;

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
