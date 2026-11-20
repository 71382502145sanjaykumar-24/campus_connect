import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../db';
import { authenticateToken, signToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/auth/departments - Public department list for registration form dropdown
router.get('/departments', async (req, res): Promise<void> => {
  try {
    const departments = await prisma.department.findMany({
      select: {
        id: true,
        code: true,
        name: true,
      },
      orderBy: { code: 'asc' },
    });
    res.json(departments);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch departments for registration', error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'College email and password are required' });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        studentProfile: {
          include: {
            department: true,
            hostelRoom: true,
          },
        },
        facultyProfile: {
          include: {
            department: true,
          },
        },
      },
    });

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials. User account not found.' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ message: 'Your account has been deactivated. Please contact the college administrator.' });
      return;
    }

    const isMatch = await bcrypt.compare(String(password), user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials. Incorrect password.' });
      return;
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      studentId: user.studentProfile?.id,
      facultyId: user.facultyProfile?.id,
    };

    const token = signToken(tokenPayload);

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entity: 'USER',
        entityId: user.id,
        details: `User ${user.email} logged in with role ${user.role}`,
        ipAddress: (req.ip as string) || '127.0.0.1',
      },
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
        studentProfile: user.studentProfile,
        facultyProfile: user.facultyProfile,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error during login', error: error.message });
  }
});

// POST /api/auth/register - Register authorized new user (Student, Faculty, Staff)
router.post('/register', async (req, res): Promise<void> => {
  try {
    const {
      name,
      email,
      password,
      role = 'STUDENT',
      phone,
      departmentId,
      rollNo,
      employeeId,
      semester = 1,
      batch = '2024-2028',
      designation = 'Assistant Professor',
      qualification = 'M.Tech / Ph.D',
    } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: 'Full name, email, and password are required' });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters long' });
      return;
    }

    // Check existing email
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      res.status(409).json({ message: 'An account with this email address already exists. Please log in.' });
      return;
    }

    const validRoles = ['STUDENT', 'FACULTY', 'STAFF'];
    const assignedRole = validRoles.includes(role.toUpperCase()) ? role.toUpperCase() : 'STUDENT';

    // Verify role specific requirements
    if (assignedRole === 'STUDENT') {
      if (!rollNo) {
        res.status(400).json({ message: 'Student roll number / register number is required' });
        return;
      }
      if (!departmentId) {
        res.status(400).json({ message: 'Department selection is required for students' });
        return;
      }
      const existingRoll = await prisma.student.findUnique({
        where: { rollNo: String(rollNo).trim() },
      });
      if (existingRoll) {
        res.status(409).json({ message: `Roll number ${rollNo} is already registered.` });
        return;
      }
    } else if (assignedRole === 'FACULTY') {
      if (!employeeId) {
        res.status(400).json({ message: 'Faculty employee ID is required' });
        return;
      }
      if (!departmentId) {
        res.status(400).json({ message: 'Department selection is required for faculty' });
        return;
      }
      const existingEmp = await prisma.faculty.findUnique({
        where: { employeeId: String(employeeId).trim() },
      });
      if (existingEmp) {
        res.status(409).json({ message: `Employee ID ${employeeId} is already registered.` });
        return;
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create user and profile in transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: String(name).trim(),
          email: normalizedEmail,
          passwordHash,
          role: assignedRole,
          phone: phone ? String(phone).trim() : null,
          isActive: true,
        },
      });

      if (assignedRole === 'STUDENT') {
        await tx.student.create({
          data: {
            userId: user.id,
            rollNo: String(rollNo).trim(),
            departmentId: String(departmentId),
            semester: Number(semester) || 1,
            batch: String(batch),
            cgpa: 0.0,
          },
        });
      } else if (assignedRole === 'FACULTY') {
        await tx.faculty.create({
          data: {
            userId: user.id,
            employeeId: String(employeeId).trim(),
            departmentId: String(departmentId),
            designation: String(designation),
            qualification: String(qualification),
          },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'REGISTER',
          entity: 'USER',
          entityId: user.id,
          details: `New ${assignedRole} registered: ${user.name} (${user.email})`,
          ipAddress: (req.ip as string) || '127.0.0.1',
        },
      });

      return user;
    });

    // Fetch full user record
    const fullUser = await prisma.user.findUnique({
      where: { id: newUser.id },
      include: {
        studentProfile: { include: { department: true } },
        facultyProfile: { include: { department: true } },
      },
    });

    if (!fullUser) {
      res.status(500).json({ message: 'User created but could not retrieve record' });
      return;
    }

    const tokenPayload = {
      id: fullUser.id,
      email: fullUser.email,
      role: fullUser.role,
      name: fullUser.name,
      studentId: fullUser.studentProfile?.id,
      facultyId: fullUser.facultyProfile?.id,
    };

    const token = signToken(tokenPayload);

    res.status(201).json({
      message: 'Account registered successfully',
      token,
      user: {
        id: fullUser.id,
        email: fullUser.email,
        role: fullUser.role,
        name: fullUser.name,
        phone: fullUser.phone,
        avatar: fullUser.avatar,
        studentProfile: fullUser.studentProfile,
        facultyProfile: fullUser.facultyProfile,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// POST /api/auth/reset-password - Password reset with email and verification identity
router.post('/reset-password', async (req, res): Promise<void> => {
  try {
    const { email, identification, newPassword } = req.body;

    if (!email || !newPassword) {
      res.status(400).json({ message: 'Email and new password are required' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ message: 'New password must be at least 6 characters long' });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        studentProfile: true,
        facultyProfile: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: 'No registered user found with this email address' });
      return;
    }

    // Identification verification: check student roll number, faculty employee ID, or admin confirm
    if (user.role === 'STUDENT' && user.studentProfile) {
      if (identification && identification.trim().toLowerCase() !== user.studentProfile.rollNo.toLowerCase()) {
        res.status(400).json({ message: 'Identity verification failed: Roll number does not match registered profile' });
        return;
      }
    } else if (user.role === 'FACULTY' && user.facultyProfile) {
      if (identification && identification.trim().toLowerCase() !== user.facultyProfile.employeeId.toLowerCase()) {
        res.status(400).json({ message: 'Identity verification failed: Faculty employee ID does not match registered profile' });
        return;
      }
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PASSWORD_RESET',
        entity: 'USER',
        entityId: user.id,
        details: `Password reset successfully for user ${user.email}`,
        ipAddress: (req.ip as string) || '127.0.0.1',
      },
    });

    res.json({ message: 'Password reset successful! You can now sign in with your new password.' });
  } catch (error: any) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Failed to reset password', error: error.message });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        studentProfile: {
          include: {
            department: true,
            hostelRoom: true,
          },
        },
        facultyProfile: {
          include: {
            department: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ message: 'User record not found' });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      phone: user.phone,
      avatar: user.avatar,
      studentProfile: user.studentProfile,
      facultyProfile: user.facultyProfile,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving user profile', error: error.message });
  }
});

// POST /api/auth/change-password
router.post('/change-password', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'Current password and new password are required' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ message: 'New password must be at least 6 characters long' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ message: 'Current password is incorrect' });
      return;
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PASSWORD_CHANGE',
        entity: 'USER',
        entityId: user.id,
        details: `Password changed for user ${user.email}`,
        ipAddress: (req.ip as string) || '127.0.0.1',
      },
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update password', error: error.message });
  }
});

export default router;
