import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../db';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/faculty
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { search, departmentId } = req.query;
    const where: any = {};

    if (departmentId && departmentId !== 'ALL') {
      where.departmentId = departmentId as string;
    }

    if (search) {
      where.OR = [
        { employeeId: { contains: search as string } },
        { user: { name: { contains: search as string } } },
        { user: { email: { contains: search as string } } },
      ];
    }

    const faculty = await prisma.faculty.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
        department: true,
        timetables: {
          include: { course: true },
        },
      },
      orderBy: { employeeId: 'asc' },
    });

    res.json(faculty);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch faculty list', error: error.message });
  }
});

// POST /api/faculty - Create new faculty
router.post('/', authenticateToken, authorizeRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, password, name, phone, employeeId, departmentId, designation, qualification, cabinLocation } = req.body;

    if (!email || !name || !employeeId || !departmentId) {
      res.status(400).json({ message: 'Email, name, employeeId, and department are required' });
      return;
    }

    const passwordHash = await bcrypt.hash(password || 'Faculty@123', 10);

    const user = await prisma.user.create({
      data: {
        email: String(email).toLowerCase().trim(),
        passwordHash,
        name: String(name),
        phone: phone ? String(phone) : null,
        role: 'FACULTY',
      },
    });

    const faculty = await prisma.faculty.create({
      data: {
        userId: user.id,
        employeeId: String(employeeId).trim(),
        departmentId: String(departmentId),
        designation: designation ? String(designation) : 'Assistant Professor',
        qualification: qualification ? String(qualification) : null,
        cabinLocation: cabinLocation ? String(cabinLocation) : null,
      },
      include: {
        user: true,
        department: true,
      },
    });

    res.status(201).json(faculty);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create faculty member', error: error.message });
  }
});

// PUT /api/faculty/:id
router.put('/:id', authenticateToken, authorizeRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { name, phone, departmentId, designation, qualification, cabinLocation } = req.body;

    const faculty = await prisma.faculty.findUnique({ where: { id } });
    if (!faculty) {
      res.status(404).json({ message: 'Faculty not found' });
      return;
    }

    if (name || phone) {
      await prisma.user.update({
        where: { id: faculty.userId },
        data: {
          name: name ? String(name) : undefined,
          phone: phone !== undefined ? (phone ? String(phone) : null) : undefined,
        },
      });
    }

    const updated = await prisma.faculty.update({
      where: { id },
      data: {
        departmentId: departmentId ? String(departmentId) : undefined,
        designation: designation ? String(designation) : undefined,
        qualification: qualification !== undefined ? (qualification ? String(qualification) : null) : undefined,
        cabinLocation: cabinLocation !== undefined ? (cabinLocation ? String(cabinLocation) : null) : undefined,
      },
      include: {
        user: true,
        department: true,
      },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update faculty', error: error.message });
  }
});

// DELETE /api/faculty/:id
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const faculty = await prisma.faculty.findUnique({ where: { id } });
    if (!faculty) {
      res.status(404).json({ message: 'Faculty not found' });
      return;
    }

    await prisma.user.delete({ where: { id: faculty.userId } });
    res.json({ message: 'Faculty deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete faculty', error: error.message });
  }
});

export default router;
