import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

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
const PORT = process.env.PORT || 5000;

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
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
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
app.listen(PORT, () => {
  console.log(`🚀 CampusConnect REST API server listening at http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
});
