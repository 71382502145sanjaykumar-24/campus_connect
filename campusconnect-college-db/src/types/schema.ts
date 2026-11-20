/**
 * CampusConnect Centralized Firebase Firestore Database Schema Definitions
 * Fully typed schema representations for all 17+ college management collections.
 */

export type UserRole =
  | 'Student'
  | 'Faculty'
  | 'HOD'
  | 'Administrator'
  | 'Placement Officer'
  | 'Librarian'
  | 'Staff';

export type AccountStatus = 'Active' | 'Pending' | 'Suspended' | 'Deactivated';

export type AttendanceStatus = 'Present' | 'Absent' | 'On Duty' | 'Approved Leave';

export type GradeLetter = 'O' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'P' | 'F';

export type ApplicationStatus = 'Applied' | 'Shortlisted' | 'Interview Scheduled' | 'Selected' | 'Rejected';

export type BookTransactionStatus = 'Issued' | 'Returned' | 'Overdue' | 'Lost';

// -----------------------------------------------------------------------------
// A. USERS COLLECTION (`users`)
// -----------------------------------------------------------------------------
export interface UserRecord {
  uid: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  departmentId?: string;
  accountStatus: AccountStatus;
  profileImage?: string;
  createdAt: string; // ISO 8601 string or Firestore Timestamp
  updatedAt: string;
  lastLogin?: string;
}

// -----------------------------------------------------------------------------
// B. STUDENTS COLLECTION (`students`)
// -----------------------------------------------------------------------------
export interface StudentRecord {
  studentId: string;
  uid: string;
  registerNumber: string; // Unique index
  fullName: string;
  email: string;
  phoneNumber?: string;
  departmentId: string;
  course: string;
  year: number; // 1, 2, 3, 4
  semester: number; // 1 to 8
  section: string; // 'A', 'B', 'C'
  admissionYear: number;
  dateOfBirth?: string;
  address?: string;
  guardianName?: string;
  guardianContact?: string;
  profileImage?: string;
  academicStatus: 'Enrolled' | 'Graduated' | 'On Leave' | 'Suspended';
  skills: string[];
  certifications: string[];
  projects: string[];
  achievements: string[];
  cgpa?: number;
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// C. FACULTY COLLECTION (`faculty`)
// -----------------------------------------------------------------------------
export interface FacultyRecord {
  facultyId: string;
  uid: string;
  employeeId: string; // Unique index
  fullName: string;
  email: string;
  phoneNumber?: string;
  departmentId: string;
  designation: 'Professor' | 'Associate Professor' | 'Assistant Professor' | 'Lecturer' | 'HOD';
  subjects: string[]; // Subject IDs handled
  assignedClasses: string[]; // e.g., ["CSE-3A", "CSE-4B"]
  joiningDate: string;
  profileImage?: string;
  availability: 'Available' | 'In Lecture' | 'On Leave' | 'Office Hours';
  accountStatus: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// D. DEPARTMENTS COLLECTION (`departments`)
// -----------------------------------------------------------------------------
export interface DepartmentRecord {
  departmentId: string;
  departmentName: string;
  departmentCode: string; // e.g. "CSE", "ECE", "MECH"
  hodId?: string; // Reference to Faculty Record
  description?: string;
  facultyCount: number;
  studentCount: number;
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// E. ATTENDANCE COLLECTION (`attendance`)
// -----------------------------------------------------------------------------
export interface AttendanceRecord {
  attendanceId: string;
  studentId: string; // References StudentRecord.studentId
  uid?: string; // Student Firebase Auth UID for quick security rules check
  subjectId: string;
  facultyId: string;
  departmentId: string;
  date: string; // YYYY-MM-DD
  hour: number; // Period hour: 1 to 8
  attendanceStatus: AttendanceStatus;
  semester: number;
  academicYear: string; // e.g. "2025-2026"
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// F. ACADEMIC RECORDS COLLECTION (`academic_records`)
// -----------------------------------------------------------------------------
export interface AcademicRecord {
  recordId: string;
  studentId: string;
  uid?: string;
  subjectId: string;
  semester: number;
  internalMarks: number; // Max 40 or 50
  assignmentMarks: number; // Max 10 or 20
  practicalMarks?: number;
  totalMarks: number; // Total out of 100
  grade: GradeLetter;
  academicYear: string;
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// G. COURSES AND SUBJECTS (`courses`, `subjects`)
// -----------------------------------------------------------------------------
export interface CourseRecord {
  courseId: string;
  courseName: string;
  courseCode: string;
  departmentId: string;
  durationYears: number;
  totalCredits: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectRecord {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  departmentId: string;
  courseId: string;
  semester: number;
  assignedFacultyId?: string;
  credits: number;
  type: 'Theory' | 'Practical' | 'Elective';
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// H. TIMETABLES COLLECTION (`timetables`)
// -----------------------------------------------------------------------------
export interface TimetableRecord {
  timetableId: string;
  departmentId: string;
  className: string; // e.g. "CSE-3A"
  semester: number;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  timeSlot: string; // "09:00 - 10:00"
  subjectId: string;
  facultyId: string;
  classroom: string; // e.g. "Block A - Room 304"
  academicYear: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// I. ASSIGNMENTS & SUBMISSIONS (`assignments`, `submissions`)
// -----------------------------------------------------------------------------
export interface AssignmentRecord {
  assignmentId: string;
  title: string;
  description: string;
  subjectId: string;
  facultyId: string;
  departmentId: string;
  deadline: string;
  attachmentUrl?: string;
  maxMarks: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionRecord {
  submissionId: string;
  assignmentId: string;
  studentId: string;
  submittedFileUrl: string;
  submissionDate: string;
  marks?: number;
  feedback?: string;
  status: 'Submitted' | 'Late' | 'Evaluated' | 'Resubmission Requested';
}

// -----------------------------------------------------------------------------
// J. EVENTS & REGISTRATIONS (`events`, `event_registrations`)
// -----------------------------------------------------------------------------
export interface EventRecord {
  eventId: string;
  eventName: string;
  description: string;
  eventType: 'Symposium' | 'Workshop' | 'Hackathon' | 'Technical' | 'Cultural' | 'Club';
  departmentId?: string;
  organizerId: string;
  venue: string;
  eventDate: string;
  registrationDeadline: string;
  capacity: number;
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface EventRegistrationRecord {
  registrationId: string;
  eventId: string;
  studentId: string;
  registrationDate: string;
  status: 'Registered' | 'Attended' | 'Cancelled';
  certificateIssued: boolean;
}

// -----------------------------------------------------------------------------
// K. PLACEMENT & INTERNSHIP COLLECTIONS
// -----------------------------------------------------------------------------
export interface CompanyRecord {
  companyId: string;
  companyName: string;
  industry: string;
  website?: string;
  contactEmail: string;
  contactPhone?: string;
  location: string;
}

export interface PlacementRecord {
  placementId: string;
  companyId: string;
  jobRole: string;
  eligibilityCriteria: {
    minCgpa: number;
    allowedDepartments: string[];
    maxBacklogs: number;
  };
  requiredSkills: string[];
  salaryPackage: string; // e.g. "12 LPA"
  applicationDeadline: string;
  status: 'Open' | 'Closed' | 'Under Review';
  createdAt: string;
}

export interface InternshipRecord {
  internshipId: string;
  companyId: string;
  role: string;
  stipend: string;
  durationMonths: number;
  eligibilityCriteria: {
    minCgpa: number;
    allowedDepartments: string[];
  };
  deadline: string;
  status: 'Open' | 'Closed';
}

export interface ApplicationRecord {
  applicationId: string;
  placementId?: string;
  internshipId?: string;
  studentId: string;
  resumeUrl: string;
  status: ApplicationStatus;
  interviewSchedule?: string;
  selectionStatus?: 'Pending' | 'Offered' | 'Joined' | 'Declined';
  appliedAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// L. LIBRARY COLLECTIONS (`library_books`, `book_transactions`)
// -----------------------------------------------------------------------------
export interface LibraryBookRecord {
  bookId: string;
  isbn: string;
  bookTitle: string;
  author: string;
  publisher: string;
  category: string;
  availableCopies: number;
  totalCopies: number;
  shelfLocation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookTransactionRecord {
  transactionId: string;
  bookId: string;
  studentId: string;
  issuedByStaffId: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  fineAmount: number;
  transactionStatus: BookTransactionStatus;
}

// -----------------------------------------------------------------------------
// M. COLLEGE FACILITIES
// -----------------------------------------------------------------------------
export interface HostelRecord {
  hostelId: string;
  roomNumber: string;
  blockName: string;
  capacity: number;
  occupiedBeds: number;
  assignedStudents: string[];
}

export interface TransportRecord {
  routeId: string;
  routeNumber: string;
  startPoint: string;
  endPoint: string;
  driverName: string;
  driverPhone: string;
  busCapacity: number;
}

export interface LaboratoryRecord {
  labId: string;
  labName: string;
  departmentId: string;
  roomNumber: string;
  inchargeFacultyId: string;
  capacity: number;
}

export interface MaintenanceRequestRecord {
  requestId: string;
  category: 'Electrical' | 'Plumbing' | 'Carpentry' | 'IT / Network' | 'Civil';
  description: string;
  location: string;
  reportedBy: string;
  assignedStaffId?: string;
  status: 'Reported' | 'In Progress' | 'Resolved';
  createdAt: string;
  resolvedAt?: string;
}

// -----------------------------------------------------------------------------
// N. COMPLAINTS & FEEDBACK
// -----------------------------------------------------------------------------
export interface ComplaintRecord {
  complaintId: string;
  userId: string;
  category: 'Academic' | 'Hostel' | 'Transport' | 'Canteen' | 'Anti-Ragging' | 'General';
  description: string;
  attachmentUrl?: string;
  submissionDate: string;
  assignedDepartment: string;
  status: 'Pending' | 'Investigating' | 'Resolved' | 'Dismissed';
  resolutionDetails?: string;
  updatedDate: string;
}

export interface FeedbackRecord {
  feedbackId: string;
  userId?: string;
  subjectId?: string;
  facultyId?: string;
  rating: number; // 1 to 5
  comments: string;
  submittedAt: string;
}

// -----------------------------------------------------------------------------
// O. NOTIFICATIONS & ANNOUNCEMENTS
// -----------------------------------------------------------------------------
export interface NotificationRecord {
  notificationId: string;
  title: string;
  message: string;
  targetRole: UserRole | 'All';
  targetDepartment?: string;
  targetUserId?: string;
  createdDate: string;
  readStatus: boolean;
  expiryDate?: string;
}

export interface AnnouncementRecord {
  announcementId: string;
  title: string;
  content: string;
  category: 'Urgent' | 'Academic' | 'Holiday' | 'Examination' | 'General';
  departmentId?: string;
  createdBy: string;
  attachmentUrl?: string;
  publishDate: string;
  expiryDate?: string;
}

// -----------------------------------------------------------------------------
// P. ACHIEVEMENTS & CERTIFICATES
// -----------------------------------------------------------------------------
export interface AchievementRecord {
  achievementId: string;
  studentId: string;
  title: string;
  category: 'Academic' | 'Sports' | 'Hackathon' | 'Research' | 'Cultural';
  description: string;
  date: string;
}

export interface CertificateRecord {
  certificateId: string;
  studentId: string;
  title: string;
  issuingOrganization: string;
  issueDate: string;
  certificateUrl: string;
  verified: boolean;
  verifiedBy?: string;
}

// -----------------------------------------------------------------------------
// Q. AUDIT LOGS (`audit_logs`) - IMMUTABLE
// -----------------------------------------------------------------------------
export interface AuditLogRecord {
  logId: string;
  userId: string;
  userRole: UserRole | 'System';
  actionType:
    | 'USER_CREATE'
    | 'USER_UPDATE'
    | 'USER_DELETE'
    | 'ATTENDANCE_LOG'
    | 'MARKS_ALTER'
    | 'GRADE_CALCULATE'
    | 'BOOK_CIRCULATION'
    | 'PERMISSION_CHANGE'
    | 'DATA_IMPORT'
    | 'DATA_EXPORT';
  collectionName: string;
  documentId: string;
  previousData?: Record<string, any>;
  updatedData?: Record<string, any>;
  ipAddress?: string;
  timestamp: string;
}
