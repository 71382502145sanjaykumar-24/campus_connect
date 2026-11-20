// Self-Contained Built-in Database for Standalone Cloud & Vercel Deployments
// Ensures CampusConnect runs 100% out of the box with zero external server dependencies!

const DB_KEY = 'cc_standalone_db_v1';

export interface StandaloneDatabase {
  users: any[];
  departments: any[];
  courses: any[];
  students: any[];
  faculty: any[];
  attendance: any[];
  marks: any[];
  timetable: any[];
  announcements: any[];
  events: any[];
  fees: any[];
  libraryBooks: any[];
  bookIssues: any[];
  hostelRooms: any[];
  leaves: any[];
  notes: any[];
  auditLogs: any[];
}

const initialDatabase: StandaloneDatabase = {
  users: [
    {
      id: 'USR_ADMIN_001',
      email: 'admin@college.com',
      name: 'System Administrator',
      role: 'ADMIN',
      phone: '+91 98765 00001',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'USR_FAC_001',
      email: 'faculty@college.com',
      name: 'Dr. Alan Turing',
      role: 'FACULTY',
      phone: '+91 98765 00002',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'USR_STU_001',
      email: 'student@college.com',
      name: 'Alex Rivera',
      role: 'STUDENT',
      phone: '+91 98765 00003',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'USR_STF_001',
      email: 'staff@college.com',
      name: 'Eleanor Vance',
      role: 'STAFF',
      phone: '+91 98765 00004',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  departments: [
    {
      id: 'DEPT_CSE',
      code: 'CSE',
      name: 'Computer Science & Engineering',
      description: 'Department of Computer Science, Software Engineering & AI',
      _count: { students: 120, faculty: 14, courses: 8 },
    },
    {
      id: 'DEPT_ECE',
      code: 'ECE',
      name: 'Electronics & Communication',
      description: 'VLSI, Embedded Systems, IoT and Telecommunications',
      _count: { students: 95, faculty: 10, courses: 6 },
    },
    {
      id: 'DEPT_MECH',
      code: 'MECH',
      name: 'Mechanical Engineering',
      description: 'Robotics, Mechatronics and CAD/CAM',
      _count: { students: 80, faculty: 8, courses: 6 },
    },
    {
      id: 'DEPT_MBA',
      code: 'MBA',
      name: 'Department of Management Studies',
      description: 'Finance, Marketing and Business Analytics',
      _count: { students: 60, faculty: 6, courses: 4 },
    },
  ],
  courses: [
    {
      id: 'CRS_CS301',
      code: 'CS301',
      name: 'Database Management Systems',
      departmentId: 'DEPT_CSE',
      credits: 4,
      semester: 5,
      department: { code: 'CSE', name: 'Computer Science & Engineering' },
    },
    {
      id: 'CRS_CS302',
      code: 'CS302',
      name: 'Operating Systems & Architecture',
      departmentId: 'DEPT_CSE',
      credits: 4,
      semester: 5,
      department: { code: 'CSE', name: 'Computer Science & Engineering' },
    },
    {
      id: 'CRS_CS303',
      code: 'CS303',
      name: 'Design and Analysis of Algorithms',
      departmentId: 'DEPT_CSE',
      credits: 3,
      semester: 5,
      department: { code: 'CSE', name: 'Computer Science & Engineering' },
    },
  ],
  students: [
    {
      id: 'STU_001',
      userId: 'USR_STU_001',
      rollNo: '2024CS001',
      departmentId: 'DEPT_CSE',
      semester: 5,
      batch: '2024-2028',
      cgpa: 9.15,
      address: 'Hostel Block B, Room 204',
      guardianName: 'Robert Rivera',
      guardianPhone: '+91 98765 11111',
      user: {
        id: 'USR_STU_001',
        name: 'Alex Rivera',
        email: 'student@college.com',
        phone: '+91 98765 00003',
      },
      department: { code: 'CSE', name: 'Computer Science & Engineering' },
    },
    {
      id: 'STU_002',
      userId: 'USR_STU_002',
      rollNo: '2024CS002',
      departmentId: 'DEPT_CSE',
      semester: 5,
      batch: '2024-2028',
      cgpa: 8.85,
      address: '42 West Coast Road',
      guardianName: 'Suresh Sharma',
      guardianPhone: '+91 98765 22222',
      user: {
        id: 'USR_STU_002',
        name: 'Priya Sharma',
        email: 'priya.s@college.com',
        phone: '+91 98765 33333',
      },
      department: { code: 'CSE', name: 'Computer Science & Engineering' },
    },
  ],
  faculty: [
    {
      id: 'FAC_001',
      userId: 'USR_FAC_001',
      employeeId: 'FAC-001',
      departmentId: 'DEPT_CSE',
      designation: 'Professor & Dean',
      qualification: 'Ph.D. in Computer Science',
      cabinLocation: 'Block A, Room 302',
      user: {
        id: 'USR_FAC_001',
        name: 'Dr. Alan Turing',
        email: 'faculty@college.com',
        phone: '+91 98765 00002',
      },
      department: { code: 'CSE', name: 'Computer Science & Engineering' },
    },
  ],
  attendance: [
    {
      id: 'ATT_001',
      studentId: 'STU_001',
      courseId: 'CRS_CS301',
      date: new Date().toISOString(),
      status: 'PRESENT',
      remarks: 'Active participation',
      student: { rollNo: '2024CS001', user: { name: 'Alex Rivera' } },
      course: { code: 'CS301', name: 'Database Management Systems' },
    },
    {
      id: 'ATT_002',
      studentId: 'STU_001',
      courseId: 'CRS_CS302',
      date: new Date(Date.now() - 86400000).toISOString(),
      status: 'PRESENT',
      remarks: 'Lab session',
      student: { rollNo: '2024CS001', user: { name: 'Alex Rivera' } },
      course: { code: 'CS302', name: 'Operating Systems & Architecture' },
    },
  ],
  marks: [
    {
      id: 'MRK_001',
      studentId: 'STU_001',
      courseId: 'CRS_CS301',
      examType: 'MID_TERM_1',
      maxMarks: 50,
      marksObtained: 46,
      remarks: 'Excellent SQL normalization',
      student: { rollNo: '2024CS001', user: { name: 'Alex Rivera' } },
      course: { code: 'CS301', name: 'Database Management Systems' },
    },
    {
      id: 'MRK_002',
      studentId: 'STU_001',
      courseId: 'CRS_CS302',
      examType: 'MID_TERM_1',
      maxMarks: 50,
      marksObtained: 44,
      remarks: 'Good thread concurrency implementation',
      student: { rollNo: '2024CS001', user: { name: 'Alex Rivera' } },
      course: { code: 'CS302', name: 'Operating Systems & Architecture' },
    },
  ],
  timetable: [
    {
      id: 'TT_001',
      departmentId: 'DEPT_CSE',
      courseId: 'CRS_CS301',
      facultyId: 'FAC_001',
      dayOfWeek: 'MONDAY',
      startTime: '09:00 AM',
      endTime: '10:00 AM',
      room: 'LH-101',
      course: { code: 'CS301', name: 'Database Management Systems' },
      faculty: { user: { name: 'Dr. Alan Turing' } },
      department: { code: 'CSE' },
    },
    {
      id: 'TT_002',
      departmentId: 'DEPT_CSE',
      courseId: 'CRS_CS302',
      facultyId: 'FAC_001',
      dayOfWeek: 'TUESDAY',
      startTime: '10:15 AM',
      endTime: '11:15 AM',
      room: 'CS-Lab 2',
      course: { code: 'CS302', name: 'Operating Systems & Architecture' },
      faculty: { user: { name: 'Dr. Alan Turing' } },
      department: { code: 'CSE' },
    },
  ],
  announcements: [
    {
      id: 'ANN_001',
      title: 'Odd Semester 2026 Examination Schedule Released',
      content: 'The official schedule for end-semester internal and lab practical examinations is available for download.',
      priority: 'HIGH',
      targetRole: 'ALL',
      authorId: 'USR_ADMIN_001',
      author: { name: 'System Administrator' },
      createdAt: new Date().toISOString(),
    },
  ],
  events: [
    {
      id: 'EVT_001',
      title: 'InnovateX 2026 — 36hr National Hackathon',
      description: 'Annual flagship technical hackathon on Generative AI and Smart Campus Solutions.',
      category: 'TECHNICAL',
      date: new Date(Date.now() + 7 * 86400000).toISOString(),
      venue: 'Auditorium Complex & Innovation Lab',
      organizer: 'CSE Department',
    },
  ],
  fees: [
    {
      id: 'FEE_001',
      studentId: 'STU_001',
      title: 'Semester 5 Tuition & Academic Fee',
      amount: 45000,
      paidAmount: 45000,
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      status: 'PAID',
      paidDate: new Date().toISOString(),
      receiptNumber: 'REC-2026-9041',
      student: { rollNo: '2024CS001', user: { name: 'Alex Rivera' } },
    },
  ],
  libraryBooks: [
    {
      id: 'BK_001',
      title: 'Database System Concepts (7th Edition)',
      author: 'Silberschatz, Korth, Sudarshan',
      isbn: '9780078022159',
      category: 'Computer Science',
      totalCopies: 15,
      availableCopies: 13,
      shelfLocation: 'CS-B2',
    },
    {
      id: 'BK_002',
      title: 'Operating System Concepts (10th Edition)',
      author: 'Abraham Silberschatz',
      isbn: '9781119320913',
      category: 'Computer Science',
      totalCopies: 10,
      availableCopies: 8,
      shelfLocation: 'CS-A4',
    },
  ],
  bookIssues: [
    {
      id: 'ISS_001',
      bookId: 'BK_001',
      studentId: 'STU_001',
      issueDate: new Date(Date.now() - 5 * 86400000).toISOString(),
      dueDate: new Date(Date.now() + 9 * 86400000).toISOString(),
      status: 'ISSUED',
      book: { title: 'Database System Concepts (7th Edition)' },
      student: { rollNo: '2024CS001', user: { name: 'Alex Rivera' } },
    },
  ],
  hostelRooms: [
    {
      id: 'HST_001',
      roomNumber: 'B-204',
      block: 'Block B',
      floor: 2,
      capacity: 2,
      occupied: 1,
      roomType: 'NON_AC',
      feePerSemester: 35000,
      students: [{ rollNo: '2024CS001', user: { name: 'Alex Rivera' } }],
    },
  ],
  leaves: [
    {
      id: 'LV_001',
      studentId: 'STU_001',
      reason: 'Attending Smart India Hackathon Regional Round',
      startDate: new Date(Date.now() + 2 * 86400000).toISOString(),
      endDate: new Date(Date.now() + 4 * 86400000).toISOString(),
      leaveType: 'ACADEMIC',
      status: 'APPROVED',
      reviewRemarks: 'Recommended and approved for college representation',
      student: { rollNo: '2024CS001', user: { name: 'Alex Rivera' } },
    },
  ],
  notes: [
    {
      id: 'NT_001',
      title: 'Unit 3: Relational Algebra & SQL Query Optimization',
      description: 'Lecture slides, practice queries, and B+ Tree indexing notes',
      courseId: 'CRS_CS301',
      facultyId: 'FAC_001',
      course: { code: 'CS301', name: 'Database Management Systems' },
      faculty: { user: { name: 'Dr. Alan Turing' } },
      createdAt: new Date().toISOString(),
    },
  ],
  auditLogs: [
    {
      id: 'LOG_001',
      userId: 'USR_ADMIN_001',
      user: { name: 'System Administrator', role: 'ADMIN' },
      action: 'SYSTEM_BOOT',
      entity: 'STANDALONE_DATABASE',
      details: 'CampusConnect standalone embedded engine initialized for cloud web deployment',
      ipAddress: '127.0.0.1',
      createdAt: new Date().toISOString(),
    },
  ],
};

function getDb(): StandaloneDatabase {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  saveDb(initialDatabase);
  return initialDatabase;
}

function saveDb(db: StandaloneDatabase) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {}
}

export const mockDb = {
  get: getDb,
  save: saveDb,

  // Auth Operations
  login: async (email: string, pass: string) => {
    const db = getDb();
    const cleanEmail = email.toLowerCase().trim();
    const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      throw new Error('Invalid credentials: user not found in database');
    }

    const studentProfile = db.students.find((s) => s.userId === user.id) || null;
    const facultyProfile = db.faculty.find((f) => f.userId === user.id) || null;

    // Log to audit trail
    db.auditLogs.unshift({
      id: `LOG_${Date.now()}`,
      userId: user.id,
      user: { name: user.name, role: user.role },
      action: 'LOGIN',
      entity: 'USER',
      details: `User ${user.email} signed in via standalone database`,
      ipAddress: 'Browser Client',
      createdAt: new Date().toISOString(),
    });
    saveDb(db);

    return {
      token: `mock_jwt_${user.id}_${Date.now()}`,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        studentProfile,
        facultyProfile,
      },
    };
  },

  getMe: async () => {
    const db = getDb();
    const token = localStorage.getItem('cc_token');
    if (!token) throw new Error('Not authenticated');

    // Extract user id from token
    const parts = token.split('_');
    const userId = parts[2] || db.users[0].id;
    const user = db.users.find((u) => u.id === userId) || db.users[0];
    const studentProfile = db.students.find((s) => s.userId === user.id) || null;
    const facultyProfile = db.faculty.find((f) => f.userId === user.id) || null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      studentProfile,
      facultyProfile,
    };
  },

  register: async (payload: any) => {
    const db = getDb();
    const cleanEmail = payload.email.toLowerCase().trim();
    if (db.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('Account with this email already exists.');
    }

    const newUserId = `USR_${Date.now()}`;
    const newUser = {
      id: newUserId,
      email: cleanEmail,
      name: payload.name,
      role: payload.role || 'STUDENT',
      phone: payload.phone || '',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.users.push(newUser);

    let studentProfile = null;
    let facultyProfile = null;

    if (newUser.role === 'STUDENT') {
      studentProfile = {
        id: `STU_${Date.now()}`,
        userId: newUserId,
        rollNo: payload.rollNo || `2024CS${Math.floor(100 + Math.random() * 900)}`,
        departmentId: payload.departmentId || 'DEPT_CSE',
        semester: Number(payload.semester) || 1,
        batch: payload.batch || '2024-2028',
        cgpa: 8.5,
        user: newUser,
        department: db.departments.find((d) => d.id === payload.departmentId) || db.departments[0],
      };
      db.students.push(studentProfile);
    } else if (newUser.role === 'FACULTY') {
      facultyProfile = {
        id: `FAC_${Date.now()}`,
        userId: newUserId,
        employeeId: payload.employeeId || `FAC-${Math.floor(100 + Math.random() * 900)}`,
        departmentId: payload.departmentId || 'DEPT_CSE',
        designation: payload.designation || 'Assistant Professor',
        qualification: 'M.Tech',
        user: newUser,
        department: db.departments.find((d) => d.id === payload.departmentId) || db.departments[0],
      };
      db.faculty.push(facultyProfile);
    }

    saveDb(db);

    return {
      token: `mock_jwt_${newUserId}_${Date.now()}`,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        phone: newUser.phone,
        studentProfile,
        facultyProfile,
      },
    };
  },

  resetPassword: async (payload: any) => {
    return { message: 'Password reset successfully! Please sign in.' };
  },

  // Generic Entities
  listUsers: async () => ({ users: getDb().users }),
  listStudents: async () => ({ students: getDb().students }),
  listFaculty: async () => getDb().faculty,
  listDepartments: async () => getDb().departments,
  listCourses: async () => getDb().courses,
  listAttendance: async () => getDb().attendance,
  listMarks: async () => getDb().marks,
  listTimetable: async () => getDb().timetable,
  listAnnouncements: async () => getDb().announcements,
  listEvents: async () => getDb().events,
  listFees: async () => getDb().fees,
  listLibraryBooks: async () => getDb().libraryBooks,
  listBookIssues: async () => getDb().bookIssues,
  listHostelRooms: async () => getDb().hostelRooms,
  listLeaves: async () => getDb().leaves,
  listNotes: async () => getDb().notes,
  listAuditLogs: async () => ({ logs: getDb().auditLogs }),
  getDashboardStats: async () => {
    const db = getDb();
    return {
      summary: {
        totalStudents: db.students.length,
        totalFaculty: db.faculty.length,
        totalCourses: db.courses.length,
        totalDepartments: db.departments.length,
        totalAttendance: db.attendance.length,
        totalMarks: db.marks.length,
        totalFees: db.fees.length,
        totalBooks: db.libraryBooks.length,
      },
    };
  },
};
