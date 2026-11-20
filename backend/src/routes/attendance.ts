import { Router, Response } from 'express';
import prisma from '../db';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/attendance
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseId, studentId, date } = req.query;
    const where: any = {};

    if (courseId && courseId !== 'ALL') {
      where.courseId = courseId as string;
    }

    if (studentId) {
      where.studentId = studentId as string;
    } else if (req.user?.role === 'STUDENT' && req.user.studentId) {
      where.studentId = req.user.studentId;
    }

    if (date) {
      const d = new Date(date as string);
      const startOfDay = new Date(d.setHours(0, 0, 0, 0));
      const endOfDay = new Date(d.setHours(23, 59, 59, 999));
      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        course: { select: { id: true, code: true, name: true } },
      },
      orderBy: { date: 'desc' },
      take: 100,
    });

    res.json(attendances);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to retrieve attendance records', error: error.message });
  }
});

// POST /api/attendance - Single or Bulk Attendance Marking
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'FACULTY'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseId, date, records } = req.body;

    if (!courseId || !date || !records || !Array.isArray(records)) {
      res.status(400).json({ message: 'courseId, date, and records array are required' });
      return;
    }

    const attendanceDate = new Date(date);
    const facultyId = req.user?.facultyId || null;

    const created = await prisma.$transaction(
      records.map((r: any) =>
        prisma.attendance.create({
          data: {
            studentId: String(r.studentId),
            courseId: String(courseId),
            date: attendanceDate,
            status: String(r.status || 'PRESENT'),
            remarks: r.remarks ? String(r.remarks) : null,
            markedByFacultyId: facultyId,
          },
        })
      )
    );

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: 'MARK_ATTENDANCE',
        entity: 'ATTENDANCE',
        entityId: String(courseId),
        details: `Marked attendance for ${records.length} students in course ${courseId}`,
        ipAddress: req.ip ? String(req.ip) : '127.0.0.1',
      },
    });

    res.status(201).json({ message: `Successfully logged ${created.length} attendance records`, records: created });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to record attendance', error: error.message });
  }
});

// PUT /api/attendance/:id
router.put('/:id', authenticateToken, authorizeRoles('ADMIN', 'FACULTY'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status, remarks } = req.body;

    const updated = await prisma.attendance.update({
      where: { id },
      data: {
        status: status ? String(status) : undefined,
        remarks: remarks !== undefined ? (remarks ? String(remarks) : null) : undefined,
      },
      include: {
        student: { include: { user: true } },
        course: true,
      },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update attendance', error: error.message });
  }
});

// DELETE /api/attendance/:id
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN', 'FACULTY'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.attendance.delete({ where: { id } });
    res.json({ message: 'Attendance record deleted' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete attendance', error: error.message });
  }
});

export default router;
