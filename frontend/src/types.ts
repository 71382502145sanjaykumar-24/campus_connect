export type Role = 'ADMIN' | 'FACULTY' | 'STUDENT' | 'STAFF';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string | null;
  avatar?: string | null;
  isActive: boolean;
  createdAt: string;
  studentProfile?: Student;
  facultyProfile?: Faculty;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  _count?: {
    students?: number;
    faculty?: number;
    courses?: number;
  };
}

export interface Course {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  credits: number;
  semester: number;
  department?: Department;
  _count?: {
    enrollments?: number;
    attendances?: number;
    marks?: number;
  };
}

export interface Student {
  id: string;
  userId: string;
  rollNo: string;
  departmentId: string;
  semester: number;
  batch: string;
  cgpa: number;
  address?: string | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
  hostelRoomId?: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    avatar?: string | null;
  };
  department: Department;
  hostelRoom?: HostelRoom | null;
  enrollments?: Array<{ id: string; course: Course }>;
  marks?: Mark[];
  attendances?: Attendance[];
  fees?: Fee[];
  bookIssues?: BookIssue[];
  leaveRequests?: LeaveRequest[];
  attendancePercentage?: number;
}

export interface Faculty {
  id: string;
  userId: string;
  employeeId: string;
  departmentId: string;
  designation: string;
  qualification?: string | null;
  cabinLocation?: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    avatar?: string | null;
  };
  department: Department;
  timetables?: TimetableSlot[];
}

export interface Attendance {
  id: string;
  studentId: string;
  courseId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks?: string | null;
  student?: {
    id: string;
    rollNo: string;
    user: { name: string; email: string };
  };
  course?: { id: string; code: string; name: string };
}

export interface Mark {
  id: string;
  studentId: string;
  courseId: string;
  examType: 'MID_TERM_1' | 'MID_TERM_2' | 'FINAL' | 'ASSIGNMENT';
  maxMarks: number;
  marksObtained: number;
  remarks?: string | null;
  student?: {
    id: string;
    rollNo: string;
    user: { name: string; email: string };
    department?: Department;
  };
  course?: { id: string; code: string; name: string };
}

export interface TimetableSlot {
  id: string;
  departmentId: string;
  courseId: string;
  facultyId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  department?: Department;
  course?: Course;
  faculty?: Faculty;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  targetRole: 'ALL' | 'STUDENT' | 'FACULTY' | 'STAFF';
  createdAt: string;
  author?: { name: string; role: string };
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  venue: string;
  organizer: string;
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  shelfLocation: string;
}

export interface BookIssue {
  id: string;
  bookId: string;
  studentId: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string | null;
  fineAmount: number;
  status: 'ISSUED' | 'RETURNED' | 'OVERDUE';
  book?: LibraryBook;
  student?: {
    id: string;
    rollNo: string;
    user: { name: string; email: string };
  };
}

export interface Fee {
  id: string;
  studentId: string;
  title: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  status: 'PAID' | 'PARTIAL' | 'PENDING' | 'OVERDUE';
  paidDate?: string | null;
  receiptNumber?: string | null;
  student?: {
    id: string;
    rollNo: string;
    user: { name: string; email: string };
    department?: { code: string };
  };
}

export interface HostelRoom {
  id: string;
  roomNumber: string;
  block: string;
  floor: number;
  capacity: number;
  occupied: number;
  roomType: string;
  feePerSemester: number;
  students?: Array<{
    id: string;
    rollNo: string;
    user: { name: string; email: string; phone?: string | null };
    department?: { code: string };
  }>;
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  reason: string;
  startDate: string;
  endDate: string;
  leaveType: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewRemarks?: string | null;
  createdAt: string;
  student?: {
    id: string;
    rollNo: string;
    user: { name: string; email: string };
    department?: { code: string };
  };
}

export interface Note {
  id: string;
  title: string;
  description?: string | null;
  courseId: string;
  facultyId: string;
  fileUrl?: string | null;
  createdAt: string;
  course?: { code: string; name: string };
  faculty?: { user: { name: string } };
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: string | null;
  ipAddress?: string | null;
  createdAt: string;
  user?: { name: string; email: string; role: string } | null;
}
