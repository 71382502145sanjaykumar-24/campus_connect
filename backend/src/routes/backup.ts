import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../db';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/backup/export/:entity - Export table to CSV
router.get('/export/:entity', authenticateToken, authorizeRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { entity } = req.params;

    if (entity === 'students') {
      const students = await prisma.student.findMany({
        include: { user: true, department: true },
        orderBy: { rollNo: 'asc' },
      });

      let csv = 'Roll No,Name,Email,Department,Semester,Batch,CGPA,Phone\n';
      students.forEach(s => {
        csv += `"${s.rollNo}","${s.user.name}","${s.user.email}","${s.department.code}",${s.semester},"${s.batch}",${s.cgpa},"${s.user.phone || ''}"\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=students_export_${Date.now()}.csv`);
      res.send(csv);
      return;
    }

    if (entity === 'faculty') {
      const faculty = await prisma.faculty.findMany({
        include: { user: true, department: true },
        orderBy: { employeeId: 'asc' },
      });

      let csv = 'Employee ID,Name,Email,Department,Designation,Qualification,Phone\n';
      faculty.forEach(f => {
        csv += `"${f.employeeId}","${f.user.name}","${f.user.email}","${f.department.code}","${f.designation}","${f.qualification || ''}","${f.user.phone || ''}"\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=faculty_export_${Date.now()}.csv`);
      res.send(csv);
      return;
    }

    if (entity === 'fees') {
      const fees = await prisma.fee.findMany({
        include: { student: { include: { user: true } } },
        orderBy: { dueDate: 'asc' },
      });

      let csv = 'Receipt No,Student Name,Roll No,Title,Amount,Paid Amount,Due Date,Status\n';
      fees.forEach(f => {
        csv += `"${f.receiptNumber || ''}","${f.student.user.name}","${f.student.rollNo}","${f.title}",${f.amount},${f.paidAmount},"${f.dueDate.toISOString().split('T')[0]}","${f.status}"\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=fees_export_${Date.now()}.csv`);
      res.send(csv);
      return;
    }

    res.status(400).json({ message: `Entity ${entity} not supported for export` });
  } catch (error: any) {
    res.status(500).json({ message: 'Export failed', error: error.message });
  }
});

// POST /api/backup/import/students - Bulk CSV/JSON import with validation
router.post('/import/students', authenticateToken, authorizeRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { rows } = req.body; // Array of { rollNo, name, email, departmentCode, semester, batch, cgpa, phone }

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      res.status(400).json({ message: 'Valid rows array required' });
      return;
    }

    const defaultPassword = await bcrypt.hash('Student@123', 10);
    const results = {
      imported: 0,
      skipped: 0,
      errors: [] as string[],
    };

    const departments = await prisma.department.findMany();
    const deptMap = new Map(departments.map(d => [d.code.toUpperCase(), d.id]));

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.rollNo || !row.name || !row.email || !row.departmentCode) {
        results.errors.push(`Row ${i + 1}: Missing required fields`);
        results.skipped++;
        continue;
      }

      const deptId = deptMap.get(row.departmentCode.toUpperCase());
      if (!deptId) {
        results.errors.push(`Row ${i + 1}: Department code ${row.departmentCode} not found`);
        results.skipped++;
        continue;
      }

      const existingRoll = await prisma.student.findUnique({ where: { rollNo: String(row.rollNo).trim() } });
      const existingEmail = await prisma.user.findUnique({ where: { email: String(row.email).toLowerCase().trim() } });

      if (existingRoll || existingEmail) {
        results.skipped++;
        results.errors.push(`Row ${i + 1}: Student with rollNo ${row.rollNo} or email ${row.email} already exists`);
        continue;
      }

      const user = await prisma.user.create({
        data: {
          email: String(row.email).toLowerCase().trim(),
          name: String(row.name),
          passwordHash: defaultPassword,
          role: 'STUDENT',
          phone: row.phone ? String(row.phone) : null,
        },
      });

      await prisma.student.create({
        data: {
          userId: user.id,
          rollNo: String(row.rollNo).trim(),
          departmentId: deptId,
          semester: row.semester ? parseInt(row.semester) : 1,
          batch: row.batch ? String(row.batch) : '2024-2028',
          cgpa: row.cgpa ? parseFloat(row.cgpa) : 0.0,
        },
      });

      results.imported++;
    }

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: 'BULK_IMPORT',
        entity: 'STUDENT',
        details: `Imported ${results.imported} students, skipped ${results.skipped}`,
        ipAddress: req.ip ? String(req.ip) : '127.0.0.1',
      },
    });

    res.json(results);
  } catch (error: any) {
    res.status(500).json({ message: 'Import operation failed', error: error.message });
  }
});

export default router;
