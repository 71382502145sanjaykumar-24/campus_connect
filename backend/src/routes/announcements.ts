import { Router, Response } from 'express';
import prisma from '../db';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/announcements
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role || 'ALL';

    const announcements = await prisma.announcement.findMany({
      where: {
        OR: [
          { targetRole: 'ALL' },
          { targetRole: userRole },
        ],
      },
      include: {
        author: { select: { name: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(announcements);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch announcements', error: error.message });
  }
});

// POST /api/announcements
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'FACULTY', 'STAFF'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, content, priority = 'NORMAL', targetRole = 'ALL' } = req.body;

    if (!title || !content) {
      res.status(400).json({ message: 'Title and content are required' });
      return;
    }

    const announcement = await prisma.announcement.create({
      data: {
        title: String(title),
        content: String(content),
        priority: String(priority),
        targetRole: String(targetRole),
        authorId: req.user!.id,
      },
      include: {
        author: { select: { name: true, role: true } },
      },
    });

    res.status(201).json(announcement);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create announcement', error: error.message });
  }
});

// PUT /api/announcements/:id
router.put('/:id', authenticateToken, authorizeRoles('ADMIN', 'FACULTY', 'STAFF'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { title, content, priority, targetRole } = req.body;

    const updated = await prisma.announcement.update({
      where: { id },
      data: {
        title: title !== undefined ? String(title) : undefined,
        content: content !== undefined ? String(content) : undefined,
        priority: priority !== undefined ? String(priority) : undefined,
        targetRole: targetRole !== undefined ? String(targetRole) : undefined,
      },
      include: {
        author: { select: { name: true, role: true } },
      },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update announcement', error: error.message });
  }
});

// DELETE /api/announcements/:id
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN', 'FACULTY', 'STAFF'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.announcement.delete({ where: { id } });
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete announcement', error: error.message });
  }
});

export default router;
