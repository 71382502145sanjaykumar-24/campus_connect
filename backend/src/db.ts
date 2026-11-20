import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Ensure uploads folder exists
const uploadsDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Robust SQLite path resolution:
// When using SQLite, resolve relative file paths to absolute path to avoid CWD mismatch between Prisma CLI and runtime.
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('file:')) {
  const prismaDb = path.resolve(__dirname, '../prisma/dev.db');
  const rootDb = path.resolve(__dirname, '../dev.db');
  const targetDb = fs.existsSync(prismaDb) ? prismaDb : rootDb;
  process.env.DATABASE_URL = `file:${targetDb.replace(/\\/g, '/')}`;
}

export const prisma = new PrismaClient();

export default prisma;
