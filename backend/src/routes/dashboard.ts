import { Router, Response } from 'express';
import prisma from '../db';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/dashboard/stats - Dynamic role-tailored dashboard stats & charts
router.get('/stats', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role;
    const studentId = req.user?.studentId;
    const facultyId = req.user?.facultyId;

    // Common announcements & events
    const [recentAnnouncements, upcomingEvents] = await Promise.all([
      prisma.announcement.findMany({
        where: {
          OR: [{ targetRole: 'ALL' }, { targetRole: userRole || 'ALL' }],
        },
        orderBy: { createdAt: 'desc' },
        take: 4,
      }),
      prisma.event.findMany({
        orderBy: { date: 'asc' },
        take: 4,
      }),
    ]);

    if (userRole === 'ADMIN') {
      const [
        totalStudents,
        totalFaculty,
        totalDepartments,
        totalCourses,
        totalBooks,
        attendanceStats,
        feesList,
        departmentsList,
        pendingLeaves,
      ] = await Promise.all([
        prisma.student.count(),
        prisma.faculty.count(),
        prisma.department.count(),
        prisma.course.count(),
        prisma.libraryBook.count(),
        prisma.attendance.groupBy({
          by: ['status'],
          _count: { status: true },
        }),
        prisma.fee.findMany({
          select: { amount: true, paidAmount: true, status: true },
        }),
        prisma.department.findMany({
          include: {
            _count: {
              select: { students: true, courses: true, faculty: true },
            },
          },
        }),
        prisma.leaveRequest.count({ where: { status: 'PENDING' } }),
      ]);

      // Calculate attendance overall %
      let totalAtt = 0;
      let presentAtt = 0;
      for (const item of attendanceStats) {
        totalAtt += item._count.status;
        if (item.status === 'PRESENT' || item.status === 'EXCUSED') {
          presentAtt += item._count.status;
        }
      }
      const overallAttendance = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 100;

      // Calculate fees summary
      let totalFeeAmount = 0;
      let totalFeePaid = 0;
      let pendingFeesCount = 0;
      for (const f of feesList) {
        totalFeeAmount += f.amount;
        totalFeePaid += f.paidAmount;
        if (f.status === 'PENDING' || f.status === 'PARTIAL' || f.status === 'OVERDUE') {
          pendingFeesCount++;
        }
      }
      const feeCollectionRate = totalFeeAmount > 0 ? Math.round((totalFeePaid / totalFeeAmount) * 100) : 100;

      // Department distribution chart data
      const departmentChartData = departmentsList.map(d => ({
        name: d.code,
        students: d._count.students,
        courses: d._count.courses,
        faculty: d._count.faculty,
      }));

      // Fee status breakdown
      const feeStatusBreakdown = [
        { name: 'Paid', value: feesList.filter(f => f.status === 'PAID').length },
        { name: 'Partial', value: feesList.filter(f => f.status === 'PARTIAL').length },
        { name: 'Pending', value: feesList.filter(f => f.status === 'PENDING' || f.status === 'OVERDUE').length },
      ];

      res.json({
        role: 'ADMIN',
        summary: {
          totalStudents,
          totalFaculty,
          totalDepartments,
          totalCourses,
          totalBooks,
          overallAttendance,
          totalFeeAmount,
          totalFeePaid,
          feeCollectionRate,
          pendingLeaves,
          pendingFeesCount,
        },
        charts: {
          departmentChartData,
          attendanceBreakdown: attendanceStats.map(a => ({ status: a.status, count: a._count.status })),
          feeStatusBreakdown,
        },
        recentAnnouncements,
        upcomingEvents,
      });
      return;
    }

    if (userRole === 'FACULTY') {
      const [
        assignedCourses,
        timetables,
        pendingLeaves,
        recentMarks,
        attendanceRecords,
      ] = await Promise.all([
        facultyId ? prisma.course.findMany({
          where: { timetables: { some: { facultyId } } },
          include: { department: true, _count: { select: { enrollments: true } } },
        }) : [],
        facultyId ? prisma.timetable.findMany({
          where: { facultyId },
          include: { course: true, department: true },
          orderBy: { startTime: 'asc' },
        }) : [],
        prisma.leaveRequest.findMany({
          where: { status: 'PENDING' },
          include: { student: { include: { user: true, department: true } } },
          take: 5,
        }),
        facultyId ? prisma.mark.findMany({
          where: { enteredByFacultyId: facultyId },
          include: { student: { include: { user: true } }, course: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }) : [],
        facultyId ? prisma.attendance.findMany({
          where: { markedByFacultyId: facultyId },
          take: 10,
          orderBy: { date: 'desc' },
        }) : [],
      ]);

      res.json({
        role: 'FACULTY',
        summary: {
          coursesCount: assignedCourses.length,
          classesCount: timetables.length,
          pendingLeavesCount: pendingLeaves.length,
          totalMarksEntered: recentMarks.length,
        },
        assignedCourses,
        todaySchedule: timetables,
        pendingLeaves,
        recentMarks,
        recentAnnouncements,
        upcomingEvents,
      });
      return;
    }

    if (userRole === 'STUDENT') {
      if (!studentId) {
        res.status(400).json({ message: 'Student profile not linked' });
        return;
      }

      const [
        student,
        attendances,
        marks,
        fees,
        bookIssues,
        leaveRequests,
        enrollments,
      ] = await Promise.all([
        prisma.student.findUnique({
          where: { id: studentId },
          include: { department: true, hostelRoom: true, user: true },
        }),
        prisma.attendance.findMany({
          where: { studentId },
          include: { course: true },
          orderBy: { date: 'desc' },
        }),
        prisma.mark.findMany({
          where: { studentId },
          include: { course: true },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.fee.findMany({
          where: { studentId },
          orderBy: { dueDate: 'asc' },
        }),
        prisma.bookIssue.findMany({
          where: { studentId, status: 'ISSUED' },
          include: { book: true },
        }),
        prisma.leaveRequest.findMany({
          where: { studentId },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.enrollment.findMany({
          where: { studentId },
          include: { course: true },
        }),
      ]);

      // Calculate attendance
      const totalAtt = attendances.length;
      const presentAtt = attendances.filter(a => a.status === 'PRESENT' || a.status === 'EXCUSED').length;
      const attendancePercentage = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 100;

      // Calculate fee dues
      let totalDue = 0;
      for (const f of fees) {
        totalDue += (f.amount - f.paidAmount);
      }

      // Course-wise attendance chart
      const courseAttendanceMap: Record<string, { total: number; present: number }> = {};
      for (const a of attendances) {
        const cCode = a.course.code;
        if (!courseAttendanceMap[cCode]) courseAttendanceMap[cCode] = { total: 0, present: 0 };
        courseAttendanceMap[cCode].total++;
        if (a.status === 'PRESENT' || a.status === 'EXCUSED') {
          courseAttendanceMap[cCode].present++;
        }
      }

      const courseAttendanceChart = Object.entries(courseAttendanceMap).map(([code, val]) => ({
        code,
        percentage: Math.round((val.present / val.total) * 100),
      }));

      res.json({
        role: 'STUDENT',
        student,
        summary: {
          attendancePercentage,
          cgpa: student?.cgpa || 0.0,
          enrolledCoursesCount: enrollments.length,
          totalDue,
          booksIssuedCount: bookIssues.length,
          pendingLeavesCount: leaveRequests.filter(l => l.status === 'PENDING').length,
        },
        charts: {
          courseAttendanceChart,
        },
        recentMarks: marks.slice(0, 5),
        fees: fees.slice(0, 5),
        activeBooks: bookIssues,
        recentAnnouncements,
        upcomingEvents,
      });
      return;
    }

    if (userRole === 'STAFF') {
      const [
        totalBooks,
        availableBooks,
        issuedBooks,
        hostelRooms,
        pendingFees,
      ] = await Promise.all([
        prisma.libraryBook.count(),
        prisma.libraryBook.aggregate({ _sum: { availableCopies: true } }),
        prisma.bookIssue.count({ where: { status: 'ISSUED' } }),
        prisma.hostelRoom.findMany(),
        prisma.fee.findMany({
          where: { status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] } },
          include: { student: { include: { user: true } } },
          take: 6,
        }),
      ]);

      const totalHostelCapacity = hostelRooms.reduce((acc, r) => acc + r.capacity, 0);
      const totalHostelOccupied = hostelRooms.reduce((acc, r) => acc + r.occupied, 0);

      res.json({
        role: 'STAFF',
        summary: {
          totalBooks,
          availableCopies: availableBooks._sum.availableCopies || 0,
          issuedBooks,
          hostelRoomsCount: hostelRooms.length,
          totalHostelCapacity,
          totalHostelOccupied,
          pendingFeesCount: pendingFees.length,
        },
        charts: {
          hostelOccupancy: [
            { name: 'Occupied', value: totalHostelOccupied },
            { name: 'Vacant', value: totalHostelCapacity - totalHostelOccupied },
          ],
        },
        pendingFees,
        recentAnnouncements,
        upcomingEvents,
      });
      return;
    }

    res.json({ role: userRole, recentAnnouncements, upcomingEvents });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch dashboard stats', error: error.message });
  }
});

export default router;
