import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../db';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/students - Search, filter, pagination
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { search, departmentId, semester, page = '1', limit = '50' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {};
    if (departmentId && departmentId !== 'ALL') {
      where.departmentId = departmentId as string;
    }
    if (semester && semester !== 'ALL') {
      where.semester = parseInt(semester as string);
    }
    if (search) {
      where.OR = [
        { rollNo: { contains: search as string } },
        { user: { name: { contains: search as string } } },
        { user: { email: { contains: search as string } } },
      ];
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true, avatar: true, isActive: true },
          },
          department: true,
          hostelRoom: true,
          _count: {
            select: {
              enrollments: true,
              attendances: true,
              marks: true,
              fees: true,
            },
          },
        },
        orderBy: { rollNo: 'asc' },
        skip,
        take,
      }),
      prisma.student.count({ where }),
    ]);

    res.json({ students, total, page: parseInt(page as string), totalPages: Math.ceil(total / take) });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch students', error: error.message });
  }
});

// GET /api/students/:id - Comprehensive student profile
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    if (req.user?.role === 'STUDENT' && req.user.studentId !== id) {
      res.status(403).json({ message: 'Forbidden: You can only view your own profile' });
      return;
    }

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
        department: true,
        hostelRoom: true,
        enrollments: {
          include: { course: true },
        },
        marks: {
          include: { course: true },
          orderBy: { createdAt: 'desc' },
        },
        attendances: {
          include: { course: true },
          orderBy: { date: 'desc' },
          take: 30,
        },
        fees: {
          orderBy: { dueDate: 'desc' },
        },
        bookIssues: {
          include: { book: true },
          orderBy: { issueDate: 'desc' },
        },
        leaveRequests: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!student) {
      res.status(404).json({ message: 'Student record not found' });
      return;
    }

    const attendancesList = (student as any).attendances || [];
    const totalAttendance = attendancesList.length;
    const presentCount = attendancesList.filter((a: any) => a.status === 'PRESENT' || a.status === 'EXCUSED').length;
    const attendancePercentage = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 100;

    res.json({ ...student, attendancePercentage });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch student details', error: error.message });
  }
});

// POST /api/students - Create new student
router.post('/', authenticateToken, authorizeRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, password, name, phone, rollNo, departmentId, semester, batch, cgpa, address, guardianName, guardianPhone, hostelRoomId } = req.body;

    if (!email || !name || !rollNo || !departmentId) {
      res.status(400).json({ message: 'Email, name, rollNo, and department are required' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email: String(email).toLowerCase().trim() } });
    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists' });
      return;
    }

    const existingRoll = await prisma.student.findUnique({ where: { rollNo: String(rollNo).trim() } });
    if (existingRoll) {
      res.status(400).json({ message: 'Roll number already assigned to another student' });
      return;
    }

    const passwordHash = await bcrypt.hash(password || 'Student@123', 10);

    const user = await prisma.user.create({
      data: {
        email: String(email).toLowerCase().trim(),
        passwordHash,
        name: String(name),
        phone: phone ? String(phone) : null,
        role: 'STUDENT',
      },
    });

    const student = await prisma.student.create({
      data: {
        userId: user.id,
        rollNo: String(rollNo).trim(),
        departmentId: String(departmentId),
        semester: semester ? parseInt(semester) : 1,
        batch: batch ? String(batch) : '2024-2028',
        cgpa: cgpa ? parseFloat(cgpa) : 0.0,
        address: address ? String(address) : null,
        guardianName: guardianName ? String(guardianName) : null,
        guardianPhone: guardianPhone ? String(guardianPhone) : null,
        hostelRoomId: hostelRoomId ? String(hostelRoomId) : null,
      },
      include: {
        user: true,
        department: true,
      },
    });

    res.status(201).json(student);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create student', error: error.message });
  }
});

// PUT /api/students/:id - Update student info
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { name, phone, semester, batch, cgpa, address, guardianName, guardianPhone, hostelRoomId, departmentId } = req.body;

    const isStudentSelf = req.user?.role === 'STUDENT' && req.user.studentId === id;
    const isAdminOrStaff = req.user?.role === 'ADMIN' || req.user?.role === 'STAFF';

    if (!isStudentSelf && !isAdminOrStaff) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    if (name || phone) {
      await prisma.user.update({
        where: { id: student.userId },
        data: {
          name: isAdminOrStaff && name ? String(name) : undefined,
          phone: phone !== undefined ? (phone ? String(phone) : null) : undefined,
        },
      });
    }

    const studentData: any = {
      address: address !== undefined ? (address ? String(address) : null) : undefined,
      guardianName: guardianName !== undefined ? (guardianName ? String(guardianName) : null) : undefined,
      guardianPhone: guardianPhone !== undefined ? (guardianPhone ? String(guardianPhone) : null) : undefined,
    };

    if (isAdminOrStaff) {
      if (semester) studentData.semester = parseInt(semester);
      if (batch) studentData.batch = String(batch);
      if (cgpa !== undefined) studentData.cgpa = parseFloat(cgpa);
      if (departmentId) studentData.departmentId = String(departmentId);
      if (hostelRoomId !== undefined) studentData.hostelRoomId = hostelRoomId ? String(hostelRoomId) : null;
    }

    const updated = await prisma.student.update({
      where: { id },
      data: studentData,
      include: {
        user: true,
        department: true,
        hostelRoom: true,
      },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update student', error: error.message });
  }
});

// DELETE /api/students/:id
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    await prisma.user.delete({ where: { id: student.userId } });

    res.json({ message: 'Student deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete student', error: error.message });
  }
});

export default router;
