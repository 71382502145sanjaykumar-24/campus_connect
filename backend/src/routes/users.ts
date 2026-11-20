import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../db';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/users - List with search, role filter, pagination
router.get('/', authenticateToken, authorizeRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { search, role, page = '1', limit = '50' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {};
    if (role && role !== 'ALL') {
      where.role = role as string;
    }
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { email: { contains: search as string } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          avatar: true,
          isActive: true,
          createdAt: true,
          studentProfile: {
            select: { id: true, rollNo: true, department: { select: { code: true, name: true } } },
          },
          facultyProfile: {
            select: { id: true, employeeId: true, designation: true, department: { select: { code: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ users, total, page: parseInt(page as string), totalPages: Math.ceil(total / take) });
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving users', error: error.message });
  }
});

// POST /api/users - Create new user
router.post('/', authenticateToken, authorizeRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, password, name, role, phone, rollNo, employeeId, departmentId, designation } = req.body;

    if (!email || !password || !name || !role) {
      res.status(400).json({ message: 'Email, password, name, and role are required' });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email: String(email).toLowerCase().trim() } });
    if (existing) {
      res.status(400).json({ message: 'A user with this email already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email: String(email).toLowerCase().trim(),
        passwordHash,
        name: String(name),
        role: String(role),
        phone: phone ? String(phone) : null,
      },
    });

    if (role === 'STUDENT' && rollNo && departmentId) {
      await prisma.student.create({
        data: {
          userId: newUser.id,
          rollNo: String(rollNo),
          departmentId: String(departmentId),
        },
      });
    } else if (role === 'FACULTY' && employeeId && departmentId) {
      await prisma.faculty.create({
        data: {
          userId: newUser.id,
          employeeId: String(employeeId),
          departmentId: String(departmentId),
          designation: designation ? String(designation) : 'Assistant Professor',
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id ? String(req.user.id) : null,
        action: 'CREATE',
        entity: 'USER',
        entityId: newUser.id,
        details: `Created new user ${newUser.email} with role ${role}`,
        ipAddress: req.ip ? String(req.ip) : '127.0.0.1',
      },
    });

    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create user', error: error.message });
  }
});

// PUT /api/users/:id - Update user
router.put('/:id', authenticateToken, authorizeRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { name, role, phone, isActive, password } = req.body;

    const data: any = {
      name: name ? String(name) : undefined,
      role: role ? String(role) : undefined,
      phone: phone !== undefined ? (phone ? String(phone) : null) : undefined,
      isActive: isActive !== undefined ? Boolean(isActive) : undefined,
    };
    if (password && password.trim().length >= 6) {
      data.passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id ? String(req.user.id) : null,
        action: 'UPDATE',
        entity: 'USER',
        entityId: id,
        details: `Updated user ${updated.email}`,
        ipAddress: req.ip ? String(req.ip) : '127.0.0.1',
      },
    });

    res.json({ message: 'User updated successfully', user: updated });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    if (id === req.user?.id) {
      res.status(400).json({ message: 'Cannot delete your own administrator account' });
      return;
    }

    const deleted = await prisma.user.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id ? String(req.user.id) : null,
        action: 'DELETE',
        entity: 'USER',
        entityId: id,
        details: `Deleted user ${deleted.email}`,
        ipAddress: req.ip ? String(req.ip) : '127.0.0.1',
      },
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
});

export default router;
