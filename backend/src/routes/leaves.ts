import { Router, Response } from 'express';
import prisma from '../db';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/leaves
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status, studentId } = req.query;
    const where: any = {};

    if (studentId) {
      where.studentId = studentId as string;
    } else if (req.user?.role === 'STUDENT' && req.user.studentId) {
      where.studentId = req.user.studentId;
    }

    if (status && status !== 'ALL') {
      where.status = status as string;
    }

    const leaves = await prisma.leaveRequest.findMany({
      where,
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
            department: { select: { code: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(leaves);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch leave requests', error: error.message });
  }
});

// POST /api/leaves - Apply for leave (Students or Admin)
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { reason, startDate, endDate, leaveType = 'SICK' } = req.body;
    let studentId = req.body.studentId;

    if (req.user?.role === 'STUDENT') {
      studentId = req.user.studentId;
    }

    if (!studentId || !reason || !startDate || !endDate) {
      res.status(400).json({ message: 'studentId, reason, startDate, and endDate are required' });
      return;
    }

    const leave = await prisma.leaveRequest.create({
      data: {
        studentId: String(studentId),
        reason: String(reason),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        leaveType: String(leaveType),
        status: 'PENDING',
      },
      include: {
        student: { include: { user: true } },
      },
    });

    res.status(201).json(leave);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to apply for leave', error: error.message });
  }
});

// PUT /api/leaves/:id/review - Approve or Reject (Faculty or Admin)
router.put('/:id/review', authenticateToken, authorizeRoles('ADMIN', 'FACULTY'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status, reviewRemarks } = req.body;

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      res.status(400).json({ message: 'Status must be either APPROVED or REJECTED' });
      return;
    }

    const facultyId = req.user?.facultyId || null;

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: String(status),
        reviewRemarks: reviewRemarks ? String(reviewRemarks) : null,
        reviewedByFacultyId: facultyId,
      },
      include: {
        student: { include: { user: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id ? String(req.user.id) : null,
        action: 'REVIEW_LEAVE',
        entity: 'LEAVE_REQUEST',
        entityId: id,
        details: `Leave marked as ${status}`,
        ipAddress: req.ip ? String(req.ip) : '127.0.0.1',
      },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to review leave request', error: error.message });
  }
});

// DELETE /api/leaves/:id
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const leave = await prisma.leaveRequest.findUnique({ where: { id } });

    if (!leave) {
      res.status(404).json({ message: 'Leave request not found' });
      return;
    }

    if (req.user?.role === 'STUDENT' && leave.studentId !== req.user.studentId) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    await prisma.leaveRequest.delete({ where: { id } });
    res.json({ message: 'Leave request cancelled' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete leave request', error: error.message });
  }
});

export default router;
