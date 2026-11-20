import { Router, Response } from 'express';
import prisma from '../db';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/timetable
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { departmentId, courseId, facultyId, dayOfWeek } = req.query;
    const where: any = {};

    if (departmentId && departmentId !== 'ALL') where.departmentId = departmentId as string;
    if (courseId && courseId !== 'ALL') where.courseId = courseId as string;
    if (facultyId && facultyId !== 'ALL') where.facultyId = facultyId as string;
    if (dayOfWeek && dayOfWeek !== 'ALL') where.dayOfWeek = dayOfWeek as string;

    const timetables = await prisma.timetable.findMany({
      where,
      include: {
        department: true,
        course: true,
        faculty: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    res.json(timetables);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch timetable', error: error.message });
  }
});

// POST /api/timetable
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'FACULTY'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { departmentId, courseId, facultyId, dayOfWeek, startTime, endTime, room } = req.body;

    if (!departmentId || !courseId || !facultyId || !dayOfWeek || !startTime || !endTime || !room) {
      res.status(400).json({ message: 'All timetable fields are required' });
      return;
    }

    const timetable = await prisma.timetable.create({
      data: {
        departmentId: String(departmentId),
        courseId: String(courseId),
        facultyId: String(facultyId),
        dayOfWeek: String(dayOfWeek).toUpperCase(),
        startTime: String(startTime),
        endTime: String(endTime),
        room: String(room),
      },
      include: {
        department: true,
        course: true,
        faculty: { include: { user: true } },
      },
    });

    res.status(201).json(timetable);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create timetable slot', error: error.message });
  }
});

// PUT /api/timetable/:id
router.put('/:id', authenticateToken, authorizeRoles('ADMIN', 'FACULTY'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { departmentId, courseId, facultyId, dayOfWeek, startTime, endTime, room } = req.body;

    const updated = await prisma.timetable.update({
      where: { id },
      data: {
        departmentId: departmentId ? String(departmentId) : undefined,
        courseId: courseId ? String(courseId) : undefined,
        facultyId: facultyId ? String(facultyId) : undefined,
        dayOfWeek: dayOfWeek ? String(dayOfWeek).toUpperCase() : undefined,
        startTime: startTime ? String(startTime) : undefined,
        endTime: endTime ? String(endTime) : undefined,
        room: room ? String(room) : undefined,
      },
      include: {
        department: true,
        course: true,
        faculty: { include: { user: true } },
      },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update timetable slot', error: error.message });
  }
});

// DELETE /api/timetable/:id
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN', 'FACULTY'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.timetable.delete({ where: { id } });
    res.json({ message: 'Timetable slot deleted' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete timetable slot', error: error.message });
  }
});

export default router;
