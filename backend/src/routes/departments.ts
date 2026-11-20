import { Router, Response } from 'express';
import prisma from '../db';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/departments
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: {
            students: true,
            faculty: true,
            courses: true,
          },
        },
      },
      orderBy: { code: 'asc' },
    });
    res.json(departments);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch departments', error: error.message });
  }
});

// POST /api/departments
router.post('/', authenticateToken, authorizeRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { code, name, description } = req.body;
    if (!code || !name) {
      res.status(400).json({ message: 'Department code and name are required' });
      return;
    }

    const dept = await prisma.department.create({
      data: {
        code: String(code).toUpperCase().trim(),
        name: String(name),
        description: description ? String(description) : null,
      },
    });

    res.status(201).json(dept);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create department', error: error.message });
  }
});

// PUT /api/departments/:id
router.put('/:id', authenticateToken, authorizeRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { code, name, description } = req.body;

    const dept = await prisma.department.update({
      where: { id },
      data: {
        code: code ? String(code).toUpperCase().trim() : undefined,
        name: name ? String(name) : undefined,
        description: description !== undefined ? (description ? String(description) : null) : undefined,
      },
    });

    res.json(dept);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update department', error: error.message });
  }
});

// DELETE /api/departments/:id
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.department.delete({ where: { id } });
    res.json({ message: 'Department deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete department', error: error.message });
  }
});

export default router;
