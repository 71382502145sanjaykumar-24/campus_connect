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
// Resolve relative SQLite file path to an absolute path so Prisma CLI and runtime always use the exact same DB.
const prismaDb = path.resolve(__dirname, '../prisma/dev.db');
const rootDb = path.resolve(__dirname, '../dev.db');
const targetDb = fs.existsSync(prismaDb) ? prismaDb : rootDb;
const sqliteUrl = `file:${targetDb.replace(/\\/g, '/')}`;

process.env.DATABASE_URL = sqliteUrl;

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: sqliteUrl,
    },
  },
});

export default prisma;
