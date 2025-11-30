import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaInstance: PrismaClient;

try {
  prismaInstance =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaInstance;
} catch (error) {
  console.error('Fehler beim Initialisieren von Prisma Client:', error);
  console.error('Stelle sicher, dass Prisma Client generiert wurde: npm run prisma:generate');
  throw error;
}

export const prisma = prismaInstance;

