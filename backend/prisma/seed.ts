import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting College Management Database Seeding...');

  // Clean existing tables in reverse dependency order
  await prisma.auditLog.deleteMany({});
  await prisma.note.deleteMany({});
  await prisma.leaveRequest.deleteMany({});
  await prisma.fee.deleteMany({});
  await prisma.bookIssue.deleteMany({});
  await prisma.libraryBook.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.timetable.deleteMany({});
  await prisma.mark.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.hostelRoom.deleteMany({});
  await prisma.faculty.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.user.deleteMany({});

  const adminPass = await bcrypt.hash('Admin@123', 10);
  const facultyPass = await bcrypt.hash('Faculty@123', 10);
  const studentPass = await bcrypt.hash('Student@123', 10);
  const staffPass = await bcrypt.hash('Staff@123', 10);

  // 1. Create Core Users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@college.com',
      passwordHash: adminPass,
      role: 'ADMIN',
      name: 'System Administrator',
      phone: '+91 98765 00001',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  const facultyUser1 = await prisma.user.create({
    data: {
      email: 'faculty@college.com',
      passwordHash: facultyPass,
      role: 'FACULTY',
      name: 'Dr. Alan Turing',
      phone: '+91 98765 00002',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  const facultyUser2 = await prisma.user.create({
    data: {
      email: 'sarah.faculty@college.com',
      passwordHash: facultyPass,
      role: 'FACULTY',
      name: 'Dr. Sarah Jenkins',
      phone: '+91 98765 00003',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    },
  });

  const studentUser1 = await prisma.user.create({
    data: {
      email: 'student@college.com',
      passwordHash: studentPass,
      role: 'STUDENT',
      name: 'Alex Rivera',
      phone: '+91 98765 00004',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    },
  });

  const studentUser2 = await prisma.user.create({
    data: {
      email: 'priya@college.com',
      passwordHash: studentPass,
      role: 'STUDENT',
      name: 'Priya Sharma',
      phone: '+91 98765 00005',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
  });

  const staffUser = await prisma.user.create({
    data: {
      email: 'staff@college.com',
      passwordHash: staffPass,
      role: 'STAFF',
      name: 'Eleanor Vance',
      phone: '+91 98765 00006',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    },
  });

  // 2. Departments
  const deptCSE = await prisma.department.create({
    data: {
      code: 'CSE',
      name: 'Computer Science & Engineering',
      description: 'Department of Computing, Software Systems and Artificial Intelligence',
    },
  });

  const deptECE = await prisma.department.create({
    data: {
      code: 'ECE',
      name: 'Electronics & Communication',
      description: 'Department of Microelectronics, Signal Processing & Embedded Systems',
    },
  });

  const deptMECH = await prisma.department.create({
    data: {
      code: 'MECH',
      name: 'Mechanical Engineering',
      description: 'Department of Thermodynamics, Robotics & Manufacturing',
    },
  });

  const deptMBA = await prisma.department.create({
    data: {
      code: 'MBA',
      name: 'Department of Management Studies',
      description: 'Finance, Marketing, Analytics & Organizational Leadership',
    },
  });

  // 3. Courses
  const courseDS = await prisma.course.create({
    data: {
      code: 'CS301',
      name: 'Data Structures & Algorithms',
      departmentId: deptCSE.id,
      credits: 4,
      semester: 5,
    },
  });

  const courseDBMS = await prisma.course.create({
    data: {
      code: 'CS302',
      name: 'Database Management Systems',
      departmentId: deptCSE.id,
      credits: 4,
      semester: 5,
    },
  });

  const courseOS = await prisma.course.create({
    data: {
      code: 'CS303',
      name: 'Operating Systems & Architecture',
      departmentId: deptCSE.id,
      credits: 3,
      semester: 5,
    },
  });

  const courseCN = await prisma.course.create({
    data: {
      code: 'CS304',
      name: 'Computer Networks & Security',
      departmentId: deptCSE.id,
      credits: 3,
      semester: 5,
    },
  });

  const courseDSP = await prisma.course.create({
    data: {
      code: 'EC201',
      name: 'Digital Signal Processing',
      departmentId: deptECE.id,
      credits: 4,
      semester: 5,
    },
  });

  // 4. Faculty Profiles
  const faculty1 = await prisma.faculty.create({
    data: {
      userId: facultyUser1.id,
      employeeId: 'FAC-001',
      departmentId: deptCSE.id,
      designation: 'Professor',
      qualification: 'Ph.D in Computing Theory',
      cabinLocation: 'Academic Block 3, Room 304',
    },
  });

  const faculty2 = await prisma.faculty.create({
    data: {
      userId: facultyUser2.id,
      employeeId: 'FAC-002',
      departmentId: deptCSE.id,
      designation: 'Associate Professor',
      qualification: 'Ph.D in Distributed Database Systems',
      cabinLocation: 'Academic Block 3, Room 308',
    },
  });

  // 5. Hostel Rooms
  const room101 = await prisma.hostelRoom.create({
    data: {
      roomNumber: 'A-101',
      block: 'Block A',
      floor: 1,
      capacity: 2,
      occupied: 1,
      roomType: 'NON_AC',
      feePerSemester: 32000,
    },
  });

  const room102 = await prisma.hostelRoom.create({
    data: {
      roomNumber: 'A-102',
      block: 'Block A',
      floor: 1,
      capacity: 2,
      occupied: 1,
      roomType: 'AC',
      feePerSemester: 45000,
    },
  });

  const room201 = await prisma.hostelRoom.create({
    data: {
      roomNumber: 'B-201',
      block: 'Block B',
      floor: 2,
      capacity: 3,
      occupied: 0,
      roomType: 'NON_AC',
      feePerSemester: 28000,
    },
  });

  // 6. Student Profiles
  const student1 = await prisma.student.create({
    data: {
      userId: studentUser1.id,
      rollNo: '2024CS001',
      departmentId: deptCSE.id,
      semester: 5,
      batch: '2024-2028',
      cgpa: 8.92,
      address: 'Room A-101, Nilgiri Hostel, University Campus',
      guardianName: 'Carlos Rivera',
      guardianPhone: '+91 98765 43210',
      hostelRoomId: room101.id,
    },
  });

  const student2 = await prisma.student.create({
    data: {
      userId: studentUser2.id,
      rollNo: '2024CS002',
      departmentId: deptCSE.id,
      semester: 5,
      batch: '2024-2028',
      cgpa: 9.15,
      address: 'Flat 402, Green Meadows Residency, College Road',
      guardianName: 'Rajesh Sharma',
      guardianPhone: '+91 98765 43211',
      hostelRoomId: room102.id,
    },
  });

  // 7. Enrollments
  const coursesList = [courseDS, courseDBMS, courseOS, courseCN];
  for (const c of coursesList) {
    await prisma.enrollment.create({
      data: {
        studentId: student1.id,
        courseId: c.id,
        semester: 5,
        academicYear: '2026-2027',
        status: 'ACTIVE',
      },
    });
    await prisma.enrollment.create({
      data: {
        studentId: student2.id,
        courseId: c.id,
        semester: 5,
        academicYear: '2026-2027',
        status: 'ACTIVE',
      },
    });
  }

  // 8. Attendance Records
  const pastDates = [
    new Date('2026-11-03T09:00:00Z'),
    new Date('2026-11-04T09:00:00Z'),
    new Date('2026-11-05T09:00:00Z'),
    new Date('2026-11-06T09:00:00Z'),
    new Date('2026-11-07T09:00:00Z'),
    new Date('2026-11-10T09:00:00Z'),
    new Date('2026-11-11T09:00:00Z'),
    new Date('2026-11-12T09:00:00Z'),
    new Date('2026-11-13T09:00:00Z'),
    new Date('2026-11-14T09:00:00Z'),
    new Date('2026-11-17T09:00:00Z'),
    new Date('2026-11-18T09:00:00Z'),
    new Date('2026-11-19T09:00:00Z'),
  ];

  for (let i = 0; i < pastDates.length; i++) {
    const d = pastDates[i];
    // Student 1 attendance
    await prisma.attendance.create({
      data: {
        studentId: student1.id,
        courseId: courseDBMS.id,
        date: d,
        status: i === 3 ? 'ABSENT' : (i === 7 ? 'LATE' : 'PRESENT'),
        remarks: i === 3 ? 'Medical leave requested' : null,
        markedByFacultyId: faculty1.id,
      },
    });
    await prisma.attendance.create({
      data: {
        studentId: student1.id,
        courseId: courseDS.id,
        date: d,
        status: 'PRESENT',
        markedByFacultyId: faculty1.id,
      },
    });

    // Student 2 attendance
    await prisma.attendance.create({
      data: {
        studentId: student2.id,
        courseId: courseDBMS.id,
        date: d,
        status: 'PRESENT',
        markedByFacultyId: faculty1.id,
      },
    });
    await prisma.attendance.create({
      data: {
        studentId: student2.id,
        courseId: courseDS.id,
        date: d,
        status: i === 5 ? 'EXCUSED' : 'PRESENT',
        remarks: i === 5 ? 'Represented college at hackathon' : null,
        markedByFacultyId: faculty1.id,
      },
    });
  }

  // 9. Marks
  await prisma.mark.createMany({
    data: [
      { studentId: student1.id, courseId: courseDBMS.id, examType: 'MID_TERM_1', maxMarks: 50, marksObtained: 46.5, remarks: 'Excellent query logic', enteredByFacultyId: faculty1.id },
      { studentId: student1.id, courseId: courseDBMS.id, examType: 'MID_TERM_2', maxMarks: 50, marksObtained: 48.0, remarks: 'Great index design', enteredByFacultyId: faculty1.id },
      { studentId: student1.id, courseId: courseDS.id, examType: 'MID_TERM_1', maxMarks: 50, marksObtained: 45.0, remarks: 'Clear binary tree algorithms', enteredByFacultyId: faculty1.id },
      { studentId: student1.id, courseId: courseOS.id, examType: 'MID_TERM_1', maxMarks: 50, marksObtained: 44.0, remarks: 'Good concurrency understanding', enteredByFacultyId: faculty2.id },
      { studentId: student1.id, courseId: courseCN.id, examType: 'ASSIGNMENT', maxMarks: 20, marksObtained: 19.0, remarks: 'Wireshark packet capture analysis done well', enteredByFacultyId: faculty2.id },

      { studentId: student2.id, courseId: courseDBMS.id, examType: 'MID_TERM_1', maxMarks: 50, marksObtained: 49.5, remarks: 'Top score in class', enteredByFacultyId: faculty1.id },
      { studentId: student2.id, courseId: courseDBMS.id, examType: 'MID_TERM_2', maxMarks: 50, marksObtained: 50.0, remarks: 'Flawless BCNF normalisation', enteredByFacultyId: faculty1.id },
      { studentId: student2.id, courseId: courseDS.id, examType: 'MID_TERM_1', maxMarks: 50, marksObtained: 48.5, remarks: 'Graph algorithms expertly implemented', enteredByFacultyId: faculty1.id },
      { studentId: student2.id, courseId: courseOS.id, examType: 'MID_TERM_1', maxMarks: 50, marksObtained: 47.0, remarks: 'Precise memory paging analysis', enteredByFacultyId: faculty2.id },
    ],
  });

  // 10. Timetable
  const schedule = [
    { day: 'MONDAY', start: '09:00 AM', end: '10:00 AM', course: courseDBMS, room: 'Room 301', faculty: faculty1 },
    { day: 'MONDAY', start: '10:00 AM', end: '11:00 AM', course: courseDS, room: 'Room 301', faculty: faculty1 },
    { day: 'MONDAY', start: '11:15 AM', end: '01:15 PM', course: courseDBMS, room: 'Database Lab 2', faculty: faculty1 },
    { day: 'TUESDAY', start: '09:00 AM', end: '10:00 AM', course: courseOS, room: 'Room 301', faculty: faculty2 },
    { day: 'TUESDAY', start: '10:00 AM', end: '11:00 AM', course: courseCN, room: 'Room 301', faculty: faculty2 },
    { day: 'WEDNESDAY', start: '09:00 AM', end: '10:00 AM', course: courseDBMS, room: 'Room 301', faculty: faculty1 },
    { day: 'WEDNESDAY', start: '10:00 AM', end: '11:00 AM', course: courseDS, room: 'Room 301', faculty: faculty1 },
    { day: 'THURSDAY', start: '09:00 AM', end: '10:00 AM', course: courseCN, room: 'Room 301', faculty: faculty2 },
    { day: 'THURSDAY', start: '10:00 AM', end: '11:00 AM', course: courseOS, room: 'Room 301', faculty: faculty2 },
    { day: 'FRIDAY', start: '09:00 AM', end: '11:00 AM', course: courseDS, room: 'Computing Lab 1', faculty: faculty1 },
    { day: 'FRIDAY', start: '11:15 AM', end: '12:15 PM', course: courseDBMS, room: 'Room 301', faculty: faculty1 },
  ];

  for (const s of schedule) {
    await prisma.timetable.create({
      data: {
        departmentId: deptCSE.id,
        courseId: s.course.id,
        facultyId: s.faculty.id,
        dayOfWeek: s.day,
        startTime: s.start,
        endTime: s.end,
        room: s.room,
      },
    });
  }

  // 11. Announcements
  await prisma.announcement.createMany({
    data: [
      {
        title: 'End-Semester Examination Schedule - Fall 2026',
        content: 'The official timetable for 3rd, 5th, and 7th semester examinations has been published. Theory exams commence on December 5, 2026.',
        priority: 'HIGH',
        targetRole: 'ALL',
        authorId: adminUser.id,
      },
      {
        title: 'Campus Placement & Internship Drive Registrations Open',
        content: 'Eligible 3rd and final year engineering students with CGPA >= 7.5 are advised to update their profiles and verify fee clearance before Nov 30.',
        priority: 'URGENT',
        targetRole: 'STUDENT',
        authorId: adminUser.id,
      },
      {
        title: 'National Hackathon "HackCampus 2026" - Register Teams',
        content: 'Annual 36-hour hackathon on AI, Cloud, and Smart Campus Solutions. Over ₹5,00,000 in cash prizes and mentor feedback from tech leaders.',
        priority: 'NORMAL',
        targetRole: 'ALL',
        authorId: adminUser.id,
      },
      {
        title: 'Winter Vacation Notice for Hostels and Library',
        content: 'Hostel and Library operations will maintain extended study schedules during reading week and winter breaks.',
        priority: 'LOW',
        targetRole: 'ALL',
        authorId: staffUser.id,
      },
    ],
  });

  // 12. Events
  await prisma.event.createMany({
    data: [
      {
        title: 'HackCampus 2026: 36-Hour National Hackathon',
        description: 'Compete in domains of Generative AI, Cloud Infrastructure, Web3, and Smart Urban Systems.',
        category: 'TECHNICAL',
        date: new Date('2026-12-18T03:30:00Z'),
        venue: 'Main Auditorium & Innovation Incubator',
        organizer: 'Department of Computer Science',
      },
      {
        title: 'Hands-on Cloud Architect & Kubernetes Workshop',
        description: 'Deep dive into Docker containers, microservices, and Kubernetes cluster orchestration.',
        category: 'WORKSHOP',
        date: new Date('2026-11-26T04:30:00Z'),
        venue: 'Seminar Hall 2, Academic Block 3',
        organizer: 'Cloud Computing Student Chapter',
      },
      {
        title: 'Zephyr 2026: Annual Inter-Collegiate Cultural Carnival',
        description: 'Music concerts, dance showcases, theater performances, and live art exhibitions.',
        category: 'CULTURAL',
        date: new Date('2027-01-20T04:00:00Z'),
        venue: 'Open Air Amphitheatre',
        organizer: 'College Cultural Committee',
      },
      {
        title: 'Inter-Department Cricket & Football Tournament',
        description: 'Annual college sports championship with knockout matches across departments.',
        category: 'SPORTS',
        date: new Date('2026-12-01T03:30:00Z'),
        venue: 'University Sports Ground',
        organizer: 'Department of Physical Education',
      },
    ],
  });

  // 13. Library Books
  const book1 = await prisma.libraryBook.create({
    data: {
      title: 'Database System Concepts (7th Edition)',
      author: 'Silberschatz, Korth, Sudarshan',
      isbn: '978-0078022159',
      category: 'Computer Science',
      totalCopies: 15,
      availableCopies: 13,
      shelfLocation: 'Floor 1, Rack CS-04',
    },
  });

  const book2 = await prisma.libraryBook.create({
    data: {
      title: 'Introduction to Algorithms (CLRS)',
      author: 'Cormen, Leiserson, Rivest, Stein',
      isbn: '978-0262033848',
      category: 'Computer Science',
      totalCopies: 20,
      availableCopies: 18,
      shelfLocation: 'Floor 1, Rack CS-03',
    },
  });

  const book3 = await prisma.libraryBook.create({
    data: {
      title: 'Operating System Concepts (10th Edition)',
      author: 'Silberschatz, Galvin, Gagne',
      isbn: '978-0133591620',
      category: 'Computer Science',
      totalCopies: 12,
      availableCopies: 11,
      shelfLocation: 'Floor 1, Rack CS-06',
    },
  });

  const book4 = await prisma.libraryBook.create({
    data: {
      title: 'Computer Networks (5th Edition)',
      author: 'Andrew S. Tanenbaum, David J. Wetherall',
      isbn: '978-0132126953',
      category: 'Computer Science',
      totalCopies: 10,
      availableCopies: 10,
      shelfLocation: 'Floor 1, Rack CS-08',
    },
  });

  const book5 = await prisma.libraryBook.create({
    data: {
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      author: 'Robert C. Martin',
      isbn: '978-0132350884',
      category: 'Software Engineering',
      totalCopies: 8,
      availableCopies: 7,
      shelfLocation: 'Floor 2, Rack SE-01',
    },
  });

  // 14. Book Issues
  await prisma.bookIssue.create({
    data: {
      bookId: book1.id,
      studentId: student1.id,
      issueDate: new Date('2026-11-10T05:00:00Z'),
      dueDate: new Date('2026-11-25T18:29:59Z'),
      status: 'ISSUED',
      issuedByStaffId: staffUser.id,
    },
  });

  await prisma.bookIssue.create({
    data: {
      bookId: book2.id,
      studentId: student1.id,
      issueDate: new Date('2026-10-01T05:00:00Z'),
      dueDate: new Date('2026-10-15T18:29:59Z'),
      returnDate: new Date('2026-10-14T09:00:00Z'),
      fineAmount: 0.0,
      status: 'RETURNED',
      issuedByStaffId: staffUser.id,
    },
  });

  await prisma.bookIssue.create({
    data: {
      bookId: book3.id,
      studentId: student2.id,
      issueDate: new Date('2026-11-12T05:00:00Z'),
      dueDate: new Date('2026-11-27T18:29:59Z'),
      status: 'ISSUED',
      issuedByStaffId: staffUser.id,
    },
  });

  // 15. Fees
  await prisma.fee.createMany({
    data: [
      {
        studentId: student1.id,
        title: 'Semester 5 Tuition & Examination Fee',
        amount: 65000,
        paidAmount: 65000,
        dueDate: new Date('2026-09-15T18:29:59Z'),
        status: 'PAID',
        paidDate: new Date('2026-09-10T10:00:00Z'),
        receiptNumber: 'RCP-2026-0421',
        recordedByStaffId: staffUser.id,
      },
      {
        studentId: student1.id,
        title: 'Hostel & Mess Charges (Fall 2026)',
        amount: 32000,
        paidAmount: 16000,
        dueDate: new Date('2026-11-30T18:29:59Z'),
        status: 'PARTIAL',
        paidDate: new Date('2026-10-05T14:30:00Z'),
        receiptNumber: 'RCP-2026-0689',
        recordedByStaffId: staffUser.id,
      },
      {
        studentId: student1.id,
        title: 'Campus Library & Lab Maintenance Fee',
        amount: 4500,
        paidAmount: 0,
        dueDate: new Date('2026-12-10T18:29:59Z'),
        status: 'PENDING',
        recordedByStaffId: staffUser.id,
      },
      {
        studentId: student2.id,
        title: 'Semester 5 Tuition & Examination Fee',
        amount: 65000,
        paidAmount: 65000,
        dueDate: new Date('2026-09-15T18:29:59Z'),
        status: 'PAID',
        paidDate: new Date('2026-09-08T11:00:00Z'),
        receiptNumber: 'RCP-2026-0398',
        recordedByStaffId: staffUser.id,
      },
      {
        studentId: student2.id,
        title: 'Hostel & AC Accommodation (Fall 2026)',
        amount: 45000,
        paidAmount: 45000,
        dueDate: new Date('2026-10-15T18:29:59Z'),
        status: 'PAID',
        paidDate: new Date('2026-10-12T16:00:00Z'),
        receiptNumber: 'RCP-2026-0712',
        recordedByStaffId: staffUser.id,
      },
    ],
  });

  // 16. Leave Requests
  await prisma.leaveRequest.create({
    data: {
      studentId: student1.id,
      reason: 'Fever and doctor prescribed 2 days rest',
      startDate: new Date('2026-11-06T00:00:00Z'),
      endDate: new Date('2026-11-07T23:59:59Z'),
      leaveType: 'SICK',
      status: 'APPROVED',
      reviewedByFacultyId: faculty1.id,
      reviewRemarks: 'Approved with medical certificate verified.',
    },
  });

  await prisma.leaveRequest.create({
    data: {
      studentId: student1.id,
      reason: 'Attending Smart India Hackathon state finals',
      startDate: new Date('2026-11-28T00:00:00Z'),
      endDate: new Date('2026-11-30T23:59:59Z'),
      leaveType: 'ACADEMIC',
      status: 'PENDING',
    },
  });

  await prisma.leaveRequest.create({
    data: {
      studentId: student2.id,
      reason: 'Attending ACM ICPC Regional Contest',
      startDate: new Date('2026-12-02T00:00:00Z'),
      endDate: new Date('2026-12-04T23:59:59Z'),
      leaveType: 'ACADEMIC',
      status: 'APPROVED',
      reviewedByFacultyId: faculty1.id,
      reviewRemarks: 'Best of luck for the finals!',
    },
  });

  // 17. Course Notes
  await prisma.note.createMany({
    data: [
      {
        title: 'Module 1: Relational Algebra & SQL Query Optimization',
        description: 'Comprehensive slides covering relational calculus, join algorithms, and execution plans.',
        courseId: courseDBMS.id,
        facultyId: faculty1.id,
        fileUrl: '/uploads/documents/dbms_module1_notes.pdf',
      },
      {
        title: 'Module 2: Transaction Management & ACID Properties',
        description: 'Detailed study on 2PL concurrency control, shadow paging, and WAL logging.',
        courseId: courseDBMS.id,
        facultyId: faculty1.id,
        fileUrl: '/uploads/documents/dbms_module2_notes.pdf',
      },
      {
        title: 'Lecture Slides: Graph Algorithms & Dynamic Programming',
        description: 'Dijkstra, Bellman-Ford, Kruskal, Prim, and Floyd-Warshall implementations with complexity bounds.',
        courseId: courseDS.id,
        facultyId: faculty1.id,
        fileUrl: '/uploads/documents/ds_graph_algorithms.pdf',
      },
    ],
  });

  // 18. Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: adminUser.id,
        action: 'SYSTEM_SEED',
        entity: 'DATABASE',
        entityId: 'ROOT',
        details: 'Initial database normalization and sample data loaded.',
        ipAddress: '127.0.0.1',
      },
      {
        userId: facultyUser1.id,
        action: 'MARK_ATTENDANCE',
        entity: 'ATTENDANCE',
        entityId: courseDBMS.id,
        details: 'Attendance marked for CS302 (DBMS) Section A.',
        ipAddress: '192.168.1.15',
      },
      {
        userId: staffUser.id,
        action: 'RECORD_FEE',
        entity: 'FEE',
        entityId: student1.id,
        details: 'Recorded partial fee payment of ₹16,000 for Hostel & Mess Charges.',
        ipAddress: '192.168.1.55',
      },
    ],
  });

  console.log('✅ College Management Database Seeding Completed Successfully!');
  console.log('📌 Login Credentials:');
  console.log('   - Admin:    admin@college.com         / Admin@123');
  console.log('   - Faculty:  faculty@college.com       / Faculty@123');
  console.log('   - Student:  student@college.com       / Student@123');
  console.log('   - Staff:    staff@college.com         / Staff@123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
