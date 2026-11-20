import { Router, Response } from 'express';
import prisma from '../db';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/audit - List audit logs
router.get('/', authenticateToken, authorizeRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { action, entity, page = '1', limit = '50' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {};
    if (action && action !== 'ALL') where.action = action as string;
    if (entity && entity !== 'ALL') where.entity = entity as string;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: { select: { name: true, email: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({ logs, total, page: parseInt(page as string), totalPages: Math.ceil(total / take) });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to retrieve audit logs', error: error.message });
  }
});

export default router;
