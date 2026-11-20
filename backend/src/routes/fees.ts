import { Router, Response } from 'express';
import prisma from '../db';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/fees
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { studentId, status } = req.query;
    const where: any = {};

    if (studentId) {
      where.studentId = studentId as string;
    } else if (req.user?.role === 'STUDENT' && req.user.studentId) {
      where.studentId = req.user.studentId;
    }

    if (status && status !== 'ALL') {
      where.status = status as string;
    }

    const fees = await prisma.fee.findMany({
      where,
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
            department: { select: { code: true } },
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    res.json(fees);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch fee records', error: error.message });
  }
});

// POST /api/fees - Create fee
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'STAFF'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { studentId, title, amount, dueDate } = req.body;

    if (!studentId || !title || !amount || !dueDate) {
      res.status(400).json({ message: 'studentId, title, amount, and dueDate are required' });
      return;
    }

    const fee = await prisma.fee.create({
      data: {
        studentId: String(studentId),
        title: String(title),
        amount: parseFloat(amount),
        dueDate: new Date(dueDate),
        status: 'PENDING',
        recordedByStaffId: req.user?.id ? String(req.user.id) : null,
      },
      include: {
        student: { include: { user: true } },
      },
    });

    res.status(201).json(fee);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create fee record', error: error.message });
  }
});

// POST /api/fees/:id/pay - Record or simulate fee payment
router.post('/:id/pay', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { amountPaid, receiptNumber } = req.body;

    const fee = await prisma.fee.findUnique({ where: { id } });
    if (!fee) {
      res.status(404).json({ message: 'Fee record not found' });
      return;
    }

    if (req.user?.role === 'STUDENT' && req.user.studentId !== fee.studentId) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    const payment = amountPaid !== undefined ? parseFloat(amountPaid) : (fee.amount - fee.paidAmount);
    const newPaidAmount = fee.paidAmount + payment;
    const newStatus = newPaidAmount >= fee.amount ? 'PAID' : 'PARTIAL';
    const receipt = receiptNumber || `RCP-${Date.now().toString().slice(-6)}`;

    const updated = await prisma.fee.update({
      where: { id },
      data: {
        paidAmount: newPaidAmount,
        status: newStatus,
        paidDate: new Date(),
        receiptNumber: receipt,
        recordedByStaffId: req.user?.id ? String(req.user.id) : fee.recordedByStaffId,
      },
      include: {
        student: { include: { user: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id ? String(req.user.id) : null,
        action: 'RECORD_FEE_PAYMENT',
        entity: 'FEE',
        entityId: id,
        details: `Paid ₹${payment} for ${fee.title}. Status: ${newStatus}`,
        ipAddress: req.ip ? String(req.ip) : '127.0.0.1',
      },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to process payment', error: error.message });
  }
});

// PUT /api/fees/:id
router.put('/:id', authenticateToken, authorizeRoles('ADMIN', 'STAFF'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { title, amount, dueDate, status, paidAmount, receiptNumber } = req.body;

    const updated = await prisma.fee.update({
      where: { id },
      data: {
        title: title ? String(title) : undefined,
        amount: amount !== undefined ? parseFloat(amount) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        status: status ? String(status) : undefined,
        paidAmount: paidAmount !== undefined ? parseFloat(paidAmount) : undefined,
        receiptNumber: receiptNumber !== undefined ? (receiptNumber ? String(receiptNumber) : null) : undefined,
      },
      include: {
        student: { include: { user: true } },
      },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update fee record', error: error.message });
  }
});

// DELETE /api/fees/:id
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN', 'STAFF'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.fee.delete({ where: { id } });
    res.json({ message: 'Fee record deleted' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete fee', error: error.message });
  }
});

export default router;
