# CampusConnect — Centralized Database Control & Dynamic Data Alteration Reference Guide

This reference document defines the complete architecture, data models, dynamic mutation lifecycle, role-based alteration permissions, audit trail mechanisms, and database engine switching procedures (SQLite & MySQL 8.0) for **CampusConnect – Smart College Management & Student Utility Platform**.

---

## 1. Executive Database Summary

- **Primary ORM Engine:** Prisma ORM (`@prisma/client` v5.10+)
- **Active Zero-Setup Engine:** SQLite persistent relational database (`backend/dev.db`)
- **Production Enterprise Engine:** MySQL 8.0+ (`prisma/schema.mysql.prisma` & `database/schema.sql`)
- **Normalized Data Models:** 18 Interconnected Models with Foreign Key Constraints & Cascading Deletions
- **Dynamic Mutation Protocol:** 100% of mutations (Create, Read, Update, Delete) are managed via typed Express REST APIs parameterized through Prisma. **No static JSON or browser `localStorage` is ever used as a primary datastore.**

---

## 2. Dynamic Database Alteration Lifecycle

Every data alteration across the platform adheres to a strict 6-stage lifecycle:

```
[React 18 Frontend Client]
        │
        ▼ (1. JSON Request with 'Authorization: Bearer <JWT>')
[Express.js REST API Layer]
        │
        ▼ (2. authenticateToken & authorizeRoles Guard)
[Input Validation & Business Rules]
        │
        ▼ (3. Parameterized Query Execution & FK Resolution)
[Prisma ORM Engine Client]
        │
        ▼ (4. ACID Transaction / SQL Query)
[SQLite (dev.db) / MySQL 8.0 Database Engine]
        │
        ▼ (5. Asynchronous Audit Logging with User UUID, Action & IP)
[audit_logs Table (Immutable)]
        │
        ▼ (6. HTTP 200/201 Response with Fresh Entity Payload)
[Frontend React UI State Refresh & Interactive Notification]
```

### Key Safety Guarantees
1. **SQL Injection Protection:** Prisma ORM automatically utilizes prepared statements and parameterized inputs for all database transactions.
2. **ACID Transaction Isolation:** Complex operations (e.g., student creation, library checkout & copy decrement, bulk CSV imports) are wrapped in `prisma.$transaction()` to guarantee atomicity. If any step fails, the entire transaction rolls back cleanly.
3. **Foreign Key Integrity:** Cascades and deletions are strictly enforced. Deleting a user automatically cascades to their respective student/faculty records, removing orphan entries.

---

## 3. Relational Schema Blueprint (18 Normalized Models)

| # | Model Name | Primary Key | Key Foreign Keys | Purpose |
|---|---|---|---|---|
| 1 | `User` | `id` (UUID) | None | Core authentication, passwords (`bcrypt`), role (`ADMIN`, `FACULTY`, `STUDENT`, `STAFF`) |
| 2 | `Department` | `id` (UUID) | None | Academic departments (`CSE`, `ECE`, `MECH`, `CIVIL`, `MBA`) |
| 3 | `Course` | `id` (UUID) | `departmentId` ➔ `Department.id` | Curriculum subjects, credit weighting, semester allocation |
| 4 | `Student` | `id` (UUID) | `userId`, `departmentId`, `hostelRoomId` | Student register/roll number, semester, batch, CGPA |
| 5 | `Faculty` | `id` (UUID) | `userId`, `departmentId` | Professor employee ID, designation, cabin location |
| 6 | `Enrollment` | `id` (UUID) | `studentId`, `courseId` | Course enrollments and semester registration |
| 7 | `Attendance` | `id` (UUID) | `studentId`, `courseId` | Session attendance records (`PRESENT`, `ABSENT`, `LATE`) |
| 8 | `Mark` | `id` (UUID) | `studentId`, `courseId` | Internal assessments & semester grades |
| 9 | `Timetable` | `id` (UUID) | `departmentId`, `courseId`, `facultyId` | Weekly class schedules, rooms, and time slots |
| 10 | `Announcement` | `id` (UUID) | `authorId` ➔ `User.id` | College notices, emergency alerts, target audiences |
| 11 | `Event` | `id` (UUID) | None | Symposia, hackathons, workshops, cultural activities |
| 12 | `LibraryBook` | `id` (UUID) | None (ISBN unique) | Catalog of titles, authors, total copies, available copies |
| 13 | `BookIssue` | `id` (UUID) | `bookId`, `studentId`, `issuedByStaffId` | Circulation ledger, due dates, returns, and fines |
| 14 | `Fee` | `id` (UUID) | `studentId` ➔ `Student.id` | Tuition, exam, hostel fee invoices, payments, and receipts |
| 15 | `HostelRoom` | `id` (UUID) | None | Room number, block name, bed capacity, occupancy |
| 16 | `LeaveRequest` | `id` (UUID) | `studentId`, `reviewedByFacultyId` | Student leave applications, status (`PENDING`, `APPROVED`) |
| 17 | `Note` | `id` (UUID) | `courseId`, `uploadedByFacultyId` | Lecture materials, syllabus PDF downloads |
| 18 | `AuditLog` | `id` (UUID) | `userId` ➔ `User.id` | Immutable security log of all table alterations |

---

## 4. Role-Based Alteration Permissions Matrix

Access control is enforced at both the API routing layer (`authorizeRoles`) and UI rendering layer:

```
┌──────────────┬────────────────────────────────────────────────────────┬────────────────────────────────────────────────┐
│ Role         │ Permitted Alterations                                  │ Prohibited Alterations                         │
├──────────────┼────────────────────────────────────────────────────────┼────────────────────────────────────────────────┤
│ ADMIN        │ • Create, update, delete all users & roles             │ None (Full Root Authority)                     │
│              │ • Modify departments, courses, curricula               │                                                │
│              │ • Generate fee structures and hostel allotments        │                                                │
│              │ • Trigger CSV bulk imports & database backups          │                                                │
│              │ • Inspect system-wide immutable audit logs             │                                                │
├──────────────┼────────────────────────────────────────────────────────┼────────────────────────────────────────────────┤
│ FACULTY      │ • Mark and alter attendance for assigned courses       │ • Cannot edit user roles or accounts           │
│              │ • Input and alter internal & semester student marks    │ • Cannot alter fees or hostel allocations      │
│              │ • Upload course study notes & syllabi                  │ • Cannot delete departmental curricula        │
│              │ • Review and approve student leave requests            │                                                │
├──────────────┼────────────────────────────────────────────────────────┼────────────────────────────────────────────────┤
│ STUDENT      │ • Update personal contact details (phone, address)     │ • Cannot alter attendance or submitted marks   │
│              │ • Submit leave applications                            │ • Cannot modify fee invoices or payment status │
│              │ • Register for upcoming college events                 │ • Cannot alter library records or timetables   │
├──────────────┼────────────────────────────────────────────────────────┼────────────────────────────────────────────────┤
│ STAFF        │ • Issue and return library books, calculate fines      │ • Cannot alter academic marks or syllabus      │
│              │ • Record student fee payments and generate receipts    │ • Cannot change faculty designations           │
│              │ • Assign and de-allocate hostel beds                   │ • Cannot delete core user profiles             │
└──────────────┴────────────────────────────────────────────────────────┴────────────────────────────────────────────────┘
```

---

## 5. Centralized Admin Database Management Dashboard

Accessible exclusively to `ADMIN` users via the **Database Management** navigation tab:

1. **Interactive Table Controller:**
   - Real-time dropdown to switch between all tables: `users`, `students`, `faculty`, `departments`, `courses`, `fees`, `attendance`, `marks`, `library_books`, `hostel_rooms`, `announcements`, `events`.
   - Live search filter across columns (name, email, roll number, department, status).
   - Direct record inspection with primary key UUID display.
2. **Database Schema & Control Reference Tab:**
   - In-app interactive architecture guide explaining data pipelines, ACID transactions, and entity relations.
3. **Data Import & Export Center:**
   - Direct CSV download for student lists, faculty records, and fee ledgers.
   - Validated batch CSV import with preview, automatic duplicate roll-number/email detection, and transaction rollback on error.
4. **Immutable Change Logs:**
   - Live stream of all database modifications including user email, role, action, target entity, record UUID, IP address, and timestamp.

---

## 6. Immutable Audit Trail Specification (`audit_logs`)

Whenever a sensitive database mutation occurs, an audit record is committed to the database:

```sql
CREATE TABLE audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,
    action VARCHAR(50) NOT NULL,       -- LOGIN, REGISTER, CREATE, UPDATE, DELETE, ATTENDANCE_MARK, MARK_ENTRY, FEE_PAYMENT
    entity VARCHAR(50) NOT NULL,       -- USER, STUDENT, FACULTY, ATTENDANCE, MARK, FEE, LIBRARY, HOSTEL
    entityId VARCHAR(36),              -- Target record UUID
    details TEXT,                      -- Human-readable change summary
    ipAddress VARCHAR(45),             -- Client IP (e.g. 127.0.0.1)
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

Ordinary users and staff have no access to alter or delete records from this table.

---

## 7. Database Engine Migration Guide: SQLite to MySQL 8.0

CampusConnect supports both **SQLite** (for instant zero-configuration local execution) and **MySQL 8.0** (for high-concurrency production deployments).

### Step 1: Prepare MySQL Database
Open your MySQL client or CLI and create the database:
```sql
CREATE DATABASE campusconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 2: Configure Environment Variables
In `backend/.env`, update the `DATABASE_URL`:
```env
# Production MySQL 8.0 Connection
DATABASE_URL="mysql://root:YourPassword@localhost:3306/campusconnect"
JWT_SECRET="super_secret_campus_connect_jwt_key_2026"
PORT=5000
```

### Step 3: Run Prisma Migration on MySQL
Execute the MySQL schema migration:
```bash
cd backend
npx prisma db push --schema=prisma/schema.mysql.prisma
```

### Step 4: Seed MySQL with Initial Data
Run the TypeScript seed script:
```bash
npx tsx prisma/seed.ts
```

*Alternatively, the pure MySQL DDL script is readily available at `database/schema.sql` and can be imported directly using:*
```bash
mysql -u root -p campusconnect < database/schema.sql
```

---

## 8. Persistence & Integrity Verification Checklist

| Verification Check | Method | Expected Result | Status |
|---|---|---|---|
| **Page Refresh** | Alter a record in UI, refresh browser | Updated value persists from database | Passed |
| **Logout & Login** | Change password / update profile, re-login | User logs in with new credentials | Passed |
| **Server Restart** | Kill backend process, restart `npm run dev` | All data persists in `dev.db` / MySQL | Passed |
| **Foreign Key Cascade** | Delete user record | Associated student/attendance records cascade | Passed |
| **Duplicate Prevention** | Register same email or roll number twice | Server rejects with HTTP 409 Conflict | Passed |
| **Audit Log Integrity** | Perform grade change or fee payment | New row appears in `audit_logs` | Passed |
