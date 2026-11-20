import { Router, Response } from 'express';
import prisma from '../db';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/events
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: 'asc' },
    });
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch events', error: error.message });
  }
});

// POST /api/events
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'STAFF'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, description, category, date, venue, organizer } = req.body;

    if (!title || !description || !category || !date || !venue || !organizer) {
      res.status(400).json({ message: 'All event fields are required' });
      return;
    }

    const event = await prisma.event.create({
      data: {
        title: String(title),
        description: String(description),
        category: String(category),
        date: new Date(date),
        venue: String(venue),
        organizer: String(organizer),
      },
    });

    res.status(201).json(event);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create event', error: error.message });
  }
});

// PUT /api/events/:id
router.put('/:id', authenticateToken, authorizeRoles('ADMIN', 'STAFF'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { title, description, category, date, venue, organizer } = req.body;

    const updated = await prisma.event.update({
      where: { id },
      data: {
        title: title ? String(title) : undefined,
        description: description ? String(description) : undefined,
        category: category ? String(category) : undefined,
        date: date ? new Date(date) : undefined,
        venue: venue ? String(venue) : undefined,
        organizer: organizer ? String(organizer) : undefined,
      },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update event', error: error.message });
  }
});

// DELETE /api/events/:id
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN', 'STAFF'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.event.delete({ where: { id } });
    res.json({ message: 'Event deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete event', error: error.message });
  }
});

export default router;
