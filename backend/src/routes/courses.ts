import { Router, Response } from 'express';
import prisma from '../db';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/courses
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { departmentId, search } = req.query;
    const where: any = {};

    if (departmentId && departmentId !== 'ALL') {
      where.departmentId = departmentId as string;
    }

    if (search) {
      where.OR = [
        { code: { contains: search as string } },
        { name: { contains: search as string } },
      ];
    }

    const courses = await prisma.course.findMany({
      where,
      include: {
        department: true,
        _count: {
          select: {
            enrollments: true,
            attendances: true,
            marks: true,
          },
        },
      },
      orderBy: { code: 'asc' },
    });

    res.json(courses);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch courses', error: error.message });
  }
});

// POST /api/courses
router.post('/', authenticateToken, authorizeRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { code, name, departmentId, credits, semester } = req.body;
    if (!code || !name || !departmentId) {
      res.status(400).json({ message: 'Course code, name, and departmentId are required' });
      return;
    }

    const course = await prisma.course.create({
      data: {
        code: String(code).toUpperCase().trim(),
        name: String(name),
        departmentId: String(departmentId),
        credits: credits ? parseInt(credits) : 3,
        semester: semester ? parseInt(semester) : 1,
      },
      include: { department: true },
    });

    res.status(201).json(course);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create course', error: error.message });
  }
});

// PUT /api/courses/:id
router.put('/:id', authenticateToken, authorizeRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { code, name, departmentId, credits, semester } = req.body;

    const course = await prisma.course.update({
      where: { id },
      data: {
        code: code ? String(code).toUpperCase().trim() : undefined,
        name: name ? String(name) : undefined,
        departmentId: departmentId ? String(departmentId) : undefined,
        credits: credits ? parseInt(credits) : undefined,
        semester: semester ? parseInt(semester) : undefined,
      },
      include: { department: true },
    });

    res.json(course);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update course', error: error.message });
  }
});

// DELETE /api/courses/:id
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.course.delete({ where: { id } });
    res.json({ message: 'Course deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete course', error: error.message });
  }
});

export default router;
