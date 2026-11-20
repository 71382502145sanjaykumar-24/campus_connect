import { db, auth } from '../src/firebaseAdmin';
import {
  DepartmentRecord,
  StudentRecord,
  FacultyRecord,
  CourseRecord,
  SubjectRecord,
  AttendanceRecord,
  AcademicRecord,
  TimetableRecord,
  AssignmentRecord,
  EventRecord,
  CompanyRecord,
  PlacementRecord,
  LibraryBookRecord,
  HostelRecord,
  NotificationRecord,
  AnnouncementRecord,
  UserRecord,
} from '../src/types/schema';
import { generateAttendanceDocId, generateStudentDocId, generateFacultyDocId } from '../src/utils/validators';

/**
 * Seed script to populate mock, realistic, non-PII records across all collections
 * in the campusconnect-college-db Firestore project.
 */
async function runSeed() {
  console.log('🌱 Starting CampusConnect Firestore Database Seed...');

  const now = new Date().toISOString();
  const batch = db.batch();

  // 1. SEED DEPARTMENTS
  console.log('  📁 Seeding Departments...');
  const departments: DepartmentRecord[] = [
    {
      departmentId: 'DEPT_CSE',
      departmentCode: 'CSE',
      departmentName: 'Computer Science & Engineering',
      description: 'Department of Computer Science, Software Engineering & AI',
      facultyCount: 24,
      studentCount: 480,
      createdAt: now,
      updatedAt: now,
    },
    {
      departmentId: 'DEPT_ECE',
      departmentCode: 'ECE',
      departmentName: 'Electronics & Communication Engineering',
      description: 'VLSI, Embedded Systems, IoT and Telecommunications',
      facultyCount: 18,
      studentCount: 360,
      createdAt: now,
      updatedAt: now,
    },
    {
      departmentId: 'DEPT_MECH',
      departmentCode: 'MECH',
      departmentName: 'Mechanical Engineering',
      description: 'Thermodynamics, Robotics, Mechatronics and CAD/CAM',
      facultyCount: 16,
      studentCount: 240,
      createdAt: now,
      updatedAt: now,
    },
    {
      departmentId: 'DEPT_MBA',
      departmentCode: 'MBA',
      departmentName: 'Department of Management Studies',
      description: 'Finance, Marketing, Business Analytics and Human Resources',
      facultyCount: 12,
      studentCount: 120,
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const dept of departments) {
    batch.set(db.collection('departments').doc(dept.departmentId), dept);
  }

  // 2. SEED USERS ACROSS ROLES
  console.log('  👥 Seeding Users for all Roles...');
  const users: UserRecord[] = [
    {
      uid: 'USR_ADMIN_001',
      fullName: 'System Administrator',
      email: 'admin@college.com',
      phoneNumber: '+91 98765 00001',
      role: 'Administrator',
      accountStatus: 'Active',
      createdAt: now,
      updatedAt: now,
    },
    {
      uid: 'USR_HOD_CSE',
      fullName: 'Dr. Katherine Johnson',
      email: 'hod.cse@college.com',
      phoneNumber: '+91 98765 00002',
      role: 'HOD',
      departmentId: 'DEPT_CSE',
      accountStatus: 'Active',
      createdAt: now,
      updatedAt: now,
    },
    {
      uid: 'USR_FAC_001',
      fullName: 'Dr. Alan Turing',
      email: 'faculty@college.com',
      phoneNumber: '+91 98765 00003',
      role: 'Faculty',
      departmentId: 'DEPT_CSE',
      accountStatus: 'Active',
      createdAt: now,
      updatedAt: now,
    },
    {
      uid: 'USR_STU_001',
      fullName: 'Alex Rivera',
      email: 'student@college.com',
      phoneNumber: '+91 98765 00004',
      role: 'Student',
      departmentId: 'DEPT_CSE',
      accountStatus: 'Active',
      createdAt: now,
      updatedAt: now,
    },
    {
      uid: 'USR_STU_002',
      fullName: 'Priya Sharma',
      email: 'priya.s@college.com',
      phoneNumber: '+91 98765 00005',
      role: 'Student',
      departmentId: 'DEPT_CSE',
      accountStatus: 'Active',
      createdAt: now,
      updatedAt: now,
    },
    {
      uid: 'USR_PLC_001',
      fullName: 'Marcus Vance',
      email: 'placement@college.com',
      phoneNumber: '+91 98765 00006',
      role: 'Placement Officer',
      accountStatus: 'Active',
      createdAt: now,
      updatedAt: now,
    },
    {
      uid: 'USR_LIB_001',
      fullName: 'Sarah Connor',
      email: 'librarian@college.com',
      phoneNumber: '+91 98765 00007',
      role: 'Librarian',
      accountStatus: 'Active',
      createdAt: now,
      updatedAt: now,
    },
    {
      uid: 'USR_STF_001',
      fullName: 'David Miller',
      email: 'staff@college.com',
      phoneNumber: '+91 98765 00008',
      role: 'Staff',
      accountStatus: 'Active',
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const user of users) {
    batch.set(db.collection('users').doc(user.uid), user);
  }

  // 3. SEED FACULTY
  console.log('  🎓 Seeding Faculty Profiles...');
  const facultyRecords: FacultyRecord[] = [
    {
      facultyId: generateFacultyDocId('FAC-001'),
      uid: 'USR_FAC_001',
      employeeId: 'FAC-001',
      fullName: 'Dr. Alan Turing',
      email: 'faculty@college.com',
      phoneNumber: '+91 98765 00003',
      departmentId: 'DEPT_CSE',
      designation: 'Professor',
      subjects: ['SUB_CS301', 'SUB_CS302'],
      assignedClasses: ['CSE-3A', 'CSE-4A'],
      joiningDate: '2020-07-15',
      availability: 'Available',
      accountStatus: 'Active',
      createdAt: now,
      updatedAt: now,
    },
    {
      facultyId: generateFacultyDocId('FAC-002'),
      uid: 'USR_HOD_CSE',
      employeeId: 'FAC-002',
      fullName: 'Dr. Katherine Johnson',
      email: 'hod.cse@college.com',
      phoneNumber: '+91 98765 00002',
      departmentId: 'DEPT_CSE',
      designation: 'HOD',
      subjects: ['SUB_CS303'],
      assignedClasses: ['CSE-3B'],
      joiningDate: '2018-06-01',
      availability: 'Office Hours',
      accountStatus: 'Active',
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const fac of facultyRecords) {
    batch.set(db.collection('faculty').doc(fac.facultyId), fac);
  }

  // 4. SEED STUDENTS
  console.log('  🎒 Seeding Student Profiles...');
  const students: StudentRecord[] = [
    {
      studentId: generateStudentDocId('2024CS001'),
      uid: 'USR_STU_001',
      registerNumber: '2024CS001',
      fullName: 'Alex Rivera',
      email: 'student@college.com',
      phoneNumber: '+91 98765 00004',
      departmentId: 'DEPT_CSE',
      course: 'B.Tech Computer Science',
      year: 3,
      semester: 5,
      section: 'A',
      admissionYear: 2024,
      dateOfBirth: '2004-05-14',
      address: 'Hostel Block B, Room 204, Campus Hostel',
      guardianName: 'Robert Rivera',
      guardianContact: '+91 98765 44444',
      academicStatus: 'Enrolled',
      skills: ['TypeScript', 'React', 'Node.js', 'Firebase', 'Data Structures', 'Python'],
      certifications: ['Google Cloud Associate Cloud Engineer', 'AWS Cloud Practitioner'],
      projects: ['CampusConnect Web App', 'AI Chatbot for Academic Query'],
      achievements: ['1st Place - Inter-college Hackathon 2025', 'Dean Merit List 2024'],
      cgpa: 9.15,
      createdAt: now,
      updatedAt: now,
    },
    {
      studentId: generateStudentDocId('2024CS002'),
      uid: 'USR_STU_002',
      registerNumber: '2024CS002',
      fullName: 'Priya Sharma',
      email: 'priya.s@college.com',
      phoneNumber: '+91 98765 00005',
      departmentId: 'DEPT_CSE',
      course: 'B.Tech Computer Science',
      year: 3,
      semester: 5,
      section: 'A',
      admissionYear: 2024,
      dateOfBirth: '2004-09-22',
      address: '45 Green Avenue, Gandhi Nagar',
      guardianName: 'Suresh Sharma',
      guardianContact: '+91 98765 55555',
      academicStatus: 'Enrolled',
      skills: ['Java', 'Spring Boot', 'MySQL', 'Docker', 'Machine Learning'],
      certifications: ['Oracle Certified Professional Java SE 17'],
      projects: ['Automated Attendance Recognition System'],
      achievements: ['Smart India Hackathon Finalist 2025'],
      cgpa: 8.85,
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const stu of students) {
    batch.set(db.collection('students').doc(stu.studentId), stu);
  }

  // 5. SEED COURSES & SUBJECTS
  console.log('  📚 Seeding Courses & Subjects...');
  const courses: CourseRecord[] = [
    {
      courseId: 'CRS_BTECH_CSE',
      courseCode: 'CS101',
      courseName: 'Bachelor of Technology in Computer Science',
      departmentId: 'DEPT_CSE',
      durationYears: 4,
      totalCredits: 160,
      createdAt: now,
      updatedAt: now,
    },
  ];
  for (const crs of courses) {
    batch.set(db.collection('courses').doc(crs.courseId), crs);
  }

  const subjects: SubjectRecord[] = [
    {
      subjectId: 'SUB_CS301',
      subjectCode: 'CS301',
      subjectName: 'Database Management Systems',
      departmentId: 'DEPT_CSE',
      courseId: 'CRS_BTECH_CSE',
      semester: 5,
      assignedFacultyId: 'FAC_FAC001',
      credits: 4,
      type: 'Theory',
      createdAt: now,
      updatedAt: now,
    },
    {
      subjectId: 'SUB_CS302',
      subjectCode: 'CS302',
      subjectName: 'Operating Systems & System Architecture',
      departmentId: 'DEPT_CSE',
      courseId: 'CRS_BTECH_CSE',
      semester: 5,
      assignedFacultyId: 'FAC_FAC001',
      credits: 4,
      type: 'Theory',
      createdAt: now,
      updatedAt: now,
    },
  ];
  for (const sub of subjects) {
    batch.set(db.collection('subjects').doc(sub.subjectId), sub);
  }

  // 6. SEED ATTENDANCE (Deduplicated)
  console.log('  🕒 Seeding Attendance Ledger...');
  const attendanceRecords: AttendanceRecord[] = [
    {
      attendanceId: generateAttendanceDocId('STU_2024CS001', 'SUB_CS301', '2026-11-18', 1),
      studentId: 'STU_2024CS001',
      uid: 'USR_STU_001',
      subjectId: 'SUB_CS301',
      facultyId: 'FAC_FAC001',
      departmentId: 'DEPT_CSE',
      date: '2026-11-18',
      hour: 1,
      attendanceStatus: 'Present',
      semester: 5,
      academicYear: '2026-2027',
      createdAt: now,
      updatedAt: now,
    },
    {
      attendanceId: generateAttendanceDocId('STU_2024CS001', 'SUB_CS302', '2026-11-18', 2),
      studentId: 'STU_2024CS001',
      uid: 'USR_STU_001',
      subjectId: 'SUB_CS302',
      facultyId: 'FAC_FAC001',
      departmentId: 'DEPT_CSE',
      date: '2026-11-18',
      hour: 2,
      attendanceStatus: 'Present',
      semester: 5,
      academicYear: '2026-2027',
      createdAt: now,
      updatedAt: now,
    },
  ];
  for (const att of attendanceRecords) {
    batch.set(db.collection('attendance').doc(att.attendanceId), att);
  }

  // 7. SEED ACADEMIC RECORDS
  console.log('  📊 Seeding Academic Records & Grades...');
  const academicRecords: AcademicRecord[] = [
    {
      recordId: 'MARK_STU_2024CS001_SUB_CS301_SEM5',
      studentId: 'STU_2024CS001',
      uid: 'USR_STU_001',
      subjectId: 'SUB_CS301',
      semester: 5,
      internalMarks: 45,
      assignmentMarks: 10,
      practicalMarks: 38,
      totalMarks: 93,
      grade: 'O',
      academicYear: '2026-2027',
      createdAt: now,
      updatedAt: now,
    },
  ];
  for (const mark of academicRecords) {
    batch.set(db.collection('academic_records').doc(mark.recordId), mark);
  }

  // 8. SEED TIMETABLES
  console.log('  📅 Seeding Timetables...');
  const timetableRecords: TimetableRecord[] = [
    {
      timetableId: 'TT_CSE3A_MON_1',
      departmentId: 'DEPT_CSE',
      className: 'CSE-3A',
      semester: 5,
      day: 'Monday',
      timeSlot: '09:00 - 10:00',
      subjectId: 'SUB_CS301',
      facultyId: 'FAC_FAC001',
      classroom: 'Lecture Hall 101',
      academicYear: '2026-2027',
      updatedAt: now,
    },
  ];
  for (const tt of timetableRecords) {
    batch.set(db.collection('timetables').doc(tt.timetableId), tt);
  }

  // 9. SEED LIBRARY BOOKS
  console.log('  📖 Seeding Library Catalog...');
  const books: LibraryBookRecord[] = [
    {
      bookId: 'BOOK_9780078022159',
      isbn: '9780078022159',
      bookTitle: 'Database System Concepts (7th Edition)',
      author: 'Silberschatz, Korth, Sudarshan',
      publisher: 'McGraw-Hill Education',
      category: 'Computer Science',
      availableCopies: 12,
      totalCopies: 15,
      shelfLocation: 'CS-Section-B2',
      createdAt: now,
      updatedAt: now,
    },
    {
      bookId: 'BOOK_9780133594140',
      isbn: '9780133594140',
      bookTitle: 'Operating Systems: Internals and Design Principles',
      author: 'William Stallings',
      publisher: 'Pearson',
      category: 'Computer Science',
      availableCopies: 8,
      totalCopies: 10,
      shelfLocation: 'CS-Section-A4',
      createdAt: now,
      updatedAt: now,
    },
  ];
  for (const book of books) {
    batch.set(db.collection('library_books').doc(book.bookId), book);
  }

  // 10. SEED PLACEMENTS & COMPANIES
  console.log('  💼 Seeding Placements & Corporate Drives...');
  const companies: CompanyRecord[] = [
    {
      companyId: 'COMP_GOOGLE',
      companyName: 'Google Cloud Innovations',
      industry: 'Cloud Infrastructure & AI',
      website: 'https://cloud.google.com',
      contactEmail: 'campus-recruitment@google.com',
      location: 'Bengaluru / Hyderabad',
    },
  ];
  for (const comp of companies) {
    batch.set(db.collection('companies').doc(comp.companyId), comp);
  }

  const placements: PlacementRecord[] = [
    {
      placementId: 'PLC_GOOGLE_SDE_2026',
      companyId: 'COMP_GOOGLE',
      jobRole: 'Associate Software Development Engineer',
      eligibilityCriteria: {
        minCgpa: 8.0,
        allowedDepartments: ['DEPT_CSE', 'DEPT_ECE'],
        maxBacklogs: 0,
      },
      requiredSkills: ['Data Structures', 'Algorithms', 'Distributed Systems', 'TypeScript/Python/Go'],
      salaryPackage: '18.5 LPA',
      applicationDeadline: '2026-12-15',
      status: 'Open',
      createdAt: now,
    },
  ];
  for (const plc of placements) {
    batch.set(db.collection('placements').doc(plc.placementId), plc);
  }

  // 11. SEED EVENTS
  console.log('  🎉 Seeding College Events...');
  const events: EventRecord[] = [
    {
      eventId: 'EVT_HACK_2026',
      eventName: 'InnovateX 2026 — 36hr National Hackathon',
      description: 'Annual flagship technical hackathon on Generative AI and Smart Campus Solutions',
      eventType: 'Hackathon',
      departmentId: 'DEPT_CSE',
      organizerId: 'FAC_FAC001',
      venue: 'Auditorium Complex & Central Innovation Lab',
      eventDate: '2026-12-05T09:00:00Z',
      registrationDeadline: '2026-12-01T23:59:59Z',
      capacity: 300,
      status: 'Upcoming',
      createdAt: now,
      updatedAt: now,
    },
  ];
  for (const ev of events) {
    batch.set(db.collection('events').doc(ev.eventId), ev);
  }

  // 12. SEED NOTIFICATIONS & ANNOUNCEMENTS
  console.log('  📢 Seeding Notifications & Circulars...');
  const announcements: AnnouncementRecord[] = [
    {
      announcementId: 'ANN_EXAM_SCHEDULE_2026',
      title: 'End-Semester Examination Timetable Published',
      content: 'The official schedule for Odd Semester 2026-2027 theory and practical examinations is available for download.',
      category: 'Examination',
      departmentId: 'DEPT_CSE',
      createdBy: 'USR_ADMIN_001',
      publishDate: now,
    },
  ];
  for (const ann of announcements) {
    batch.set(db.collection('announcements').doc(ann.announcementId), ann);
  }

  // 13. SEED AUDIT LOG
  console.log('  🛡️ Initializing Immutable Audit Trail...');
  const auditDoc = db.collection('audit_logs').doc();
  batch.set(auditDoc, {
    logId: auditDoc.id,
    userId: 'USR_ADMIN_001',
    userRole: 'Administrator',
    actionType: 'DATA_IMPORT',
    collectionName: 'SYSTEM_INITIALIZATION',
    documentId: 'ALL',
    details: 'Initial database seed successfully executed for CampusConnect Firebase Project',
    ipAddress: '127.0.0.1',
    timestamp: now,
  });

  // Commit batch write to Firestore
  await batch.commit();

  console.log('\n✅ Firestore Database Seeding Completed Successfully with 100% Normalized Data!');
}

runSeed().catch((err) => {
  console.error('❌ Firestore Seeding Failed:', err);
  process.exit(1);
});
