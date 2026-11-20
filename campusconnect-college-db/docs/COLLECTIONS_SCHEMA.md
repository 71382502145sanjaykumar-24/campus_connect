# CampusConnect Firestore Collections & Field Definitions

This document details all collections, documents, and data fields in `campusconnect-college-db`.

---

## 1. Primary Collections Overview

| # | Collection ID | Purpose | Document ID Convention |
|---|---|---|---|
| 1 | `users` | User credentials, roles, account status | `{uid}` (Firebase Auth UID) |
| 2 | `students` | Student academic profiles, skills, achievements | `STU_{registerNumber}` |
| 3 | `faculty` | Faculty designations, qualifications, classes | `FAC_{employeeId}` |
| 4 | `departments` | Academic departments & branches | `DEPT_{departmentCode}` |
| 5 | `attendance` | Daily attendance sessions (deduplicated) | `ATT_{studentId}_{subjectId}_{date}_H{hour}` |
| 6 | `academic_records` | Internal marks, practical marks, grades | `MARK_{studentId}_{subjectId}_SEM{semester}` |
| 7 | `courses` | Degree programs (B.Tech, MBA, M.Tech) | `CRS_{courseCode}` |
| 8 | `subjects` | Curriculum subjects & credit weighting | `SUB_{subjectCode}` |
| 9 | `timetables` | Weekly class schedules & lecture slots | `TT_{className}_{day}_H{hour}` |
| 10 | `assignments` | Course homework & projects | `ASG_{autoId}` |
| 11 | `submissions` | Student assignment uploads & grading | `SUB_{assignmentId}_{studentId}` |
| 12 | `events` | College events, hackathons, symposiums | `EVT_{autoId}` |
| 13 | `event_registrations`| Student registrations for college events | `REG_{eventId}_{studentId}` |
| 14 | `companies` | Corporate recruitment partners | `COMP_{companySlug}` |
| 15 | `placements` | Placement job postings & eligibility | `PLC_{companyId}_{jobRole}` |
| 16 | `internships` | Internship offers & stipend details | `INT_{companyId}_{role}` |
| 17 | `applications` | Student placement applications & interviews | `APP_{placementId}_{studentId}` |
| 18 | `library_books` | Library book catalog & inventory copies | `BOOK_{isbn}` |
| 19 | `book_transactions`| Circulation loans, due dates, fines | `TX_{autoId}` |
| 20 | `hostels` | Hostel blocks, rooms, bed capacity | `HST_{block}_{roomNumber}` |
| 21 | `transport` | Bus routes, stops, driver details | `BUS_{routeNumber}` |
| 22 | `laboratories` | Labs, equipment, faculty-in-charge | `LAB_{labCode}` |
| 23 | `maintenance_requests`| Campus facility repairs & tickets | `MNT_{autoId}` |
| 24 | `complaints` | Student/Staff grievances | `CMP_{autoId}` |
| 25 | `feedback` | Academic & faculty course evaluations | `FDB_{autoId}` |
| 26 | `notifications` | Role-targeted push notifications | `NOTIF_{autoId}` |
| 27 | `announcements` | Official college circulars | `ANN_{autoId}` |
| 28 | `achievements` | Co-curricular & sports achievements | `ACH_{autoId}` |
| 29 | `certificates` | Uploaded student certificates & verification | `CRT_{autoId}` |
| 30 | `audit_logs` | Immutable audit trail of all alterations | `LOG_{autoId}` |

---

## 2. Detailed Field Specifications

### A. `users`
- `uid` (string, required): Firebase Authentication unique user ID.
- `fullName` (string, required): Full legal name.
- `email` (string, required): College email address (`user@college.com`).
- `phoneNumber` (string, optional): International format (+91...).
- `role` (string, required): `Student` | `Faculty` | `HOD` | `Administrator` | `Placement Officer` | `Librarian` | `Staff`.
- `departmentId` (string, optional): Foreign key pointing to `departments/{departmentId}`.
- `accountStatus` (string, required): `Active` | `Pending` | `Suspended` | `Deactivated`.
- `profileImage` (string, optional): Cloud Storage download URL.
- `createdAt` (string, required): ISO 8601 timestamp.
- `updatedAt` (string, required): ISO 8601 timestamp.
- `lastLogin` (string, optional): Timestamp of last sign-in.

### B. `students`
- `studentId` (string, required): Unique document ID (`STU_{registerNumber}`).
- `uid` (string, required): Foreign key pointing to `users/{uid}`.
- `registerNumber` (string, required, unique): Official registration/roll number (e.g. `2024CS001`).
- `fullName` (string, required): Student's full name.
- `email` (string, required): Registered email.
- `phoneNumber` (string, optional): Primary phone.
- `departmentId` (string, required): Enrolled department (e.g. `DEPT_CSE`).
- `course` (string, required): Degree name (e.g. `B.Tech Computer Science`).
- `year` (number, required): Year of study (1 to 4).
- `semester` (number, required): Semester (1 to 8).
- `section` (string, required): Section (`A`, `B`, `C`).
- `admissionYear` (number, required): Year admitted (e.g. `2024`).
- `dateOfBirth` (string, optional): Date of birth (`YYYY-MM-DD`).
- `address` (string, optional): Residential or hostel address.
- `guardianName` (string, optional): Parent or guardian name.
- `guardianContact` (string, optional): Parent phone number.
- `profileImage` (string, optional): URL to profile photo.
- `academicStatus` (string, required): `Enrolled` | `Graduated` | `On Leave` | `Suspended`.
- `skills` (array of strings): Technical and soft skills (e.g. `["React", "Python", "Cloud"]`).
- `certifications` (array of strings): Completed certifications.
- `projects` (array of strings): Academic and personal project titles.
- `achievements` (array of strings): Awards and honors.
- `cgpa` (number, optional): Cumulative Grade Point Average (0.00 to 10.00).
- `createdAt` (string, required): Creation timestamp.
- `updatedAt` (string, required): Last modification timestamp.

### C. `faculty`
- `facultyId` (string, required): Unique document ID (`FAC_{employeeId}`).
- `uid` (string, required): Foreign key to `users/{uid}`.
- `employeeId` (string, required, unique): Faculty staff ID (e.g. `FAC-001`).
- `fullName` (string, required): Professor's name.
- `email` (string, required): Faculty email.
- `phoneNumber` (string, optional): Contact number.
- `departmentId` (string, required): Department ID.
- `designation` (string, required): `Professor` | `Associate Professor` | `Assistant Professor` | `Lecturer` | `HOD`.
- `subjects` (array of strings): List of Subject IDs handled.
- `assignedClasses` (array of strings): List of class IDs assigned (e.g. `["CSE-3A", "CSE-4B"]`).
- `joiningDate` (string, required): Date joined.
- `availability` (string, required): `Available` | `In Lecture` | `On Leave` | `Office Hours`.
- `accountStatus` (string, required): `Active` | `Suspended`.
- `createdAt` (string, required): Timestamp.
- `updatedAt` (string, required): Timestamp.

### D. `attendance`
- `attendanceId` (string, required): Deterministic ID `ATT_{studentId}_{subjectId}_{date}_H{hour}`.
- `studentId` (string, required): Reference to `students/{studentId}`.
- `uid` (string, optional): Auth UID of student for quick security checks.
- `subjectId` (string, required): Reference to `subjects/{subjectId}`.
- `facultyId` (string, required): Reference to `faculty/{facultyId}` who marked attendance.
- `departmentId` (string, required): Department ID.
- `date` (string, required): Date formatted as `YYYY-MM-DD`.
- `hour` (number, required): Class hour (1 to 8).
- `attendanceStatus` (string, required): `Present` | `Absent` | `On Duty` | `Approved Leave`.
- `semester` (number, required): Semester.
- `academicYear` (string, required): Academic year (e.g. `2026-2027`).
- `remarks` (string, optional): Reason for absence or on-duty details.
- `createdAt` (string, required): Timestamp.
- `updatedAt` (string, required): Timestamp.

### E. `academic_records`
- `recordId` (string, required): `MARK_{studentId}_{subjectId}_SEM{semester}`.
- `studentId` (string, required): Reference to student.
- `uid` (string, optional): Auth UID of student.
- `subjectId` (string, required): Reference to subject.
- `semester` (number, required): Semester number.
- `internalMarks` (number, required): Internal assessment score (out of 50).
- `assignmentMarks` (number, required): Assignment marks (out of 10).
- `practicalMarks` (number, optional): Practical examination score (out of 40).
- `totalMarks` (number, required): Aggregate total score (out of 100).
- `grade` (string, required): Computed grade letter (`O`, `A+`, `A`, `B+`, `B`, `C`, `P`, `F`).
- `academicYear` (string, required): Academic year.
- `createdAt` (string, required): Timestamp.
- `updatedAt` (string, required): Timestamp.

### F. `audit_logs` (Immutable)
- `logId` (string, required): Auto-generated unique log ID.
- `userId` (string, required): UID of user who performed the operation (or `System`).
- `userRole` (string, required): Role at the time of execution.
- `actionType` (string, required): `USER_CREATE` | `USER_UPDATE` | `USER_DELETE` | `ATTENDANCE_LOG` | `MARKS_ALTER` | `GRADE_CALCULATE` | `BOOK_CIRCULATION` | `PERMISSION_CHANGE` | `DATA_IMPORT` | `DATA_EXPORT`.
- `collectionName` (string, required): Target collection affected.
- `documentId` (string, required): Document ID modified.
- `previousData` (map, optional): Document state before alteration.
- `updatedData` (map, optional): Document state after alteration.
- `ipAddress` (string, optional): Client IP address.
- `timestamp` (string, required): ISO 8601 timestamp.
