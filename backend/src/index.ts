import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// Fallback environment variable defaults
if (!process.env.PORT) process.env.PORT = '5000';
if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'super_secret_campus_connect_jwt_key_2026';

import prisma from './db';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import departmentRoutes from './routes/departments';
import courseRoutes from './routes/courses';
import studentRoutes from './routes/students';
import facultyRoutes from './routes/faculty';
import attendanceRoutes from './routes/attendance';
import marksRoutes from './routes/marks';
import timetableRoutes from './routes/timetable';
import announcementRoutes from './routes/announcements';
import eventRoutes from './routes/events';
import libraryRoutes from './routes/library';
import feeRoutes from './routes/fees';
import hostelRoutes from './routes/hostel';
import leaveRoutes from './routes/leaves';
import noteRoutes from './routes/notes';
import dashboardRoutes from './routes/dashboard';
import auditRoutes from './routes/audit';
import backupRoutes from './routes/backup';

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Health check endpoint
app.get('/api/health', async (req: Request, res: Response) => {
  let dbStatus = 'ONLINE';
  let userCount = 0;
  try {
    userCount = await prisma.user.count();
  } catch (err: any) {
    dbStatus = 'OFFLINE_OR_PENDING_MIGRATION';
  }

  res.json({
    status: 'ONLINE',
    database: dbStatus,
    usersRegistered: userCount,
    service: 'CampusConnect API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/marks', marksRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/hostel', hostelRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/backup', backupRoutes);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Application Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err : undefined,
  });
});

// Start Server
const server = app.listen(PORT, async () => {
  console.log(`🚀 CampusConnect REST API server listening at http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);

  try {
    const userCount = await prisma.user.count();
    console.log(`📊 Connected to Database (${userCount} active users loaded)`);
  } catch (dbErr: any) {
    console.warn(`⚠️ Warning: Database tables not loaded. Please run 'npm run setup' to generate and seed data.`);
  }
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});

export default app;
