let PrismaClientClass: any = null;
try {
  // Dynamic require so build/runtime doesn't fail when @prisma/client is not installed
  PrismaClientClass = require('@prisma/client')?.PrismaClient;
} catch {
  // Prisma client is optional; system falls back to in-memory dbStore
}

const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

export const prisma =
  globalForPrisma.prisma ??
  (PrismaClientClass
    ? new PrismaClientClass({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      })
    : null);

if (process.env.NODE_ENV !== 'production' && prisma) {
  globalForPrisma.prisma = prisma;
}

export const isDatabaseConfigured = (): boolean => {
  return Boolean(prisma && process.env.DATABASE_URL && process.env.DATABASE_URL.length > 5);
};
