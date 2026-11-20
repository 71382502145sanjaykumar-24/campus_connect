import { Router, Response } from 'express';
import prisma from '../db';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/notes
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.query;
    const where: any = {};
    if (courseId && courseId !== 'ALL') where.courseId = courseId as string;

    const notes = await prisma.note.findMany({
      where,
      include: {
        course: { select: { code: true, name: true } },
        faculty: { include: { user: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(notes);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch notes', error: error.message });
  }
});

// POST /api/notes
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'FACULTY'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, description, courseId, fileUrl } = req.body;
    const facultyId = req.user?.facultyId;

    if (!title || !courseId) {
      res.status(400).json({ message: 'Title and courseId are required' });
      return;
    }

    let effectiveFacultyId = facultyId;
    if (!effectiveFacultyId) {
      const firstFaculty = await prisma.faculty.findFirst();
      if (!firstFaculty) {
        res.status(400).json({ message: 'No faculty available to associate with note' });
        return;
      }
      effectiveFacultyId = firstFaculty.id;
    }

    const note = await prisma.note.create({
      data: {
        title: String(title),
        description: description ? String(description) : null,
        courseId: String(courseId),
        facultyId: effectiveFacultyId,
        fileUrl: fileUrl ? String(fileUrl) : '/uploads/documents/lecture_notes_sample.pdf',
      },
      include: {
        course: true,
        faculty: { include: { user: true } },
      },
    });

    res.status(201).json(note);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to upload note', error: error.message });
  }
});

// DELETE /api/notes/:id
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN', 'FACULTY'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.note.delete({ where: { id } });
    res.json({ message: 'Note deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete note', error: error.message });
  }
});

export default router;
