import { syntheticSeedData } from '../../prisma/seed.js';
import bcrypt from 'bcryptjs';

let prismaClient = null;
let useFallback = false;

// In-memory relational store matching Prisma schema
const memoryDb = {
  users: [...syntheticSeedData.users.map(u => ({ ...u, passwordHash: bcrypt.hashSync(u.passwordPlain, 10) }))],
  reports: [...syntheticSeedData.reports],
  analysis: { ...syntheticSeedData.analysis },
  parameters: [...syntheticSeedData.parameters],
  healthRecords: [...syntheticSeedData.healthRecords],
  appointments: [...syntheticSeedData.appointments],
  notifications: [...syntheticSeedData.notifications],
  conversations: [...syntheticSeedData.conversations],
  auditLogs: []
};

try {
  const { PrismaClient } = await import('@prisma/client');
  prismaClient = new PrismaClient();
  await prismaClient.$connect();
  console.log('✅ [Database] PostgreSQL connected via Prisma Client.');
} catch (err) {
  useFallback = true;
  console.log('ℹ️ [Database] Running in Synthetic In-Memory Mode (Zero Database Config Required):', err.message);
}

export const db = {
  isFallback: useFallback,
  memory: memoryDb,
  prisma: prismaClient
};
