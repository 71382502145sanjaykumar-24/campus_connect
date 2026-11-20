import { Router, Response } from 'express';
import prisma from '../db';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/marks
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseId, studentId, examType } = req.query;
    const where: any = {};

    if (courseId && courseId !== 'ALL') {
      where.courseId = courseId as string;
    }
    if (examType && examType !== 'ALL') {
      where.examType = examType as string;
    }

    if (studentId) {
      where.studentId = studentId as string;
    } else if (req.user?.role === 'STUDENT' && req.user.studentId) {
      where.studentId = req.user.studentId;
    }

    const marks = await prisma.mark.findMany({
      where,
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
            department: true,
          },
        },
        course: { select: { id: true, code: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(marks);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch marks', error: error.message });
  }
});

// POST /api/marks - Enter marks
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'FACULTY'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { studentId, courseId, examType, maxMarks, marksObtained, remarks } = req.body;

    if (!studentId || !courseId || !examType || maxMarks === undefined || marksObtained === undefined) {
      res.status(400).json({ message: 'studentId, courseId, examType, maxMarks, and marksObtained are required' });
      return;
    }

    const facultyId = req.user?.facultyId || null;

    const mark = await prisma.mark.create({
      data: {
        studentId: String(studentId),
        courseId: String(courseId),
        examType: String(examType),
        maxMarks: parseFloat(maxMarks),
        marksObtained: parseFloat(marksObtained),
        remarks: remarks ? String(remarks) : null,
        enteredByFacultyId: facultyId,
      },
      include: {
        student: { include: { user: true } },
        course: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id ? String(req.user.id) : null,
        action: 'ENTER_MARKS',
        entity: 'MARK',
        entityId: mark.id,
        details: `Entered ${examType} marks for student ${studentId}: ${marksObtained}/${maxMarks}`,
        ipAddress: req.ip ? String(req.ip) : '127.0.0.1',
      },
    });

    res.status(201).json(mark);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to save marks', error: error.message });
  }
});

// PUT /api/marks/:id
router.put('/:id', authenticateToken, authorizeRoles('ADMIN', 'FACULTY'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { maxMarks, marksObtained, remarks, examType } = req.body;

    const updated = await prisma.mark.update({
      where: { id },
      data: {
        maxMarks: maxMarks !== undefined ? parseFloat(maxMarks) : undefined,
        marksObtained: marksObtained !== undefined ? parseFloat(marksObtained) : undefined,
        remarks: remarks !== undefined ? (remarks ? String(remarks) : null) : undefined,
        examType: examType ? String(examType) : undefined,
      },
      include: {
        student: { include: { user: true } },
        course: true,
      },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update marks', error: error.message });
  }
});

// DELETE /api/marks/:id
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN', 'FACULTY'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.mark.delete({ where: { id } });
    res.json({ message: 'Mark entry deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete marks', error: error.message });
  }
});

export default router;
