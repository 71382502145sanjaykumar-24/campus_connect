# CampusConnect – Smart College Management & Student Utility Platform

A full-stack, responsive, database-driven college management web application built with **React (Vite)**, **Tailwind CSS**, **Node.js (Express)**, and **Prisma ORM** (relational SQLite / MySQL).

---

## 🚀 Features by Role

### 👑 1. Administrator (`admin@college.com` / `Admin@123`)
- **Centralized Database Center**: Direct table browser, row management, and data synchronization.
- **User & Profile Management**: Complete CRUD for students, faculty, and administrative staff.
- **Academic Structure**: Add, edit, and organize Departments and accredited Courses.
- **Billing & Fee Administration**: Issue tuition, hostel, and lab fee invoices; track campus-wide fee collections.
- **Batch CSV Import & Export**: Validated student/faculty bulk CSV imports and filtered exports.
- **Immutable Audit Trail**: Monitor all creations, updates, logins, and deletions with timestamps and IP logging.
- **Campus Communications**: Publish college-wide announcements and schedule major campus events.

### 🎓 2. Faculty (`faculty@college.com` / `Faculty@123`)
- **Assigned Lecture Schedules**: Real-time weekly timetable view with classroom and lab locations.
- **Bulk Daily Attendance**: Quick 1-click attendance marking (`Present`, `Absent`, `Late`, `Excused`) saved in atomic database transactions.
- **Continuous Assessment (CIE)**: Enter and edit marks for Mid-Term 1, Mid-Term 2, Final, and Assignments.
- **Leave Request Approvals**: Review pending student medical/academic leave applications with customized remarks.
- **Course Study Materials**: Upload lecture notes, syllabi, and reference links for enrolled students.

### 🎒 3. Student (`student@college.com` / `Student@123`)
- **Personalized Academic Dashboard**: Real-time attendance percentage gauge (compliance threshold monitoring), CGPA display.
- **Assessment History**: View subject-wise internal examination scores and faculty feedback.
- **Fee Payment Gateway**: View fee dues and simulate instant database-persisted payments with official receipt generation.
- **Online Leave Applications**: Apply for sick, academic, or casual leaves with status tracking.
- **Library Catalog & Borrowing**: Search books by title, author, category, or ISBN; monitor borrowed books and due dates.
- **Campus Life**: View upcoming symposiums, hackathons, and administrative announcements.

### 📋 4. Staff (`staff@college.com` / `Staff@123`)
- **Library Book Circulation**: Issue books to students (auto-decrements available copies) and process returns (with overdue fine calculations).
- **Hostel Facility Management**: Room capacity tracking, residential allocations, bed assignments, and vacancy reports.
- **Fee Collection**: Record offline and online student fee payments and generate receipts.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Recharts |
| **Backend** | Node.js, Express.js REST API, TypeScript (`tsx`) |
| **Database** | SQLite (zero-setup local persistence) / MySQL 8.0 via **Prisma ORM** |
| **Security** | JWT authentication, bcrypt password hashing, role-based authorization |

---

## 📦 Project Structure

```
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Prisma relational schema (SQLite)
│   │   ├── schema.mysql.prisma  # Production MySQL schema
│   │   └── seed.ts              # Database seeding script with realistic data
│   ├── src/
│   │   ├── db.ts                # Prisma client singleton
│   │   ├── index.ts             # Express server setup & middleware
│   │   ├── middleware/auth.ts   # JWT verification & role authorization
│   │   ├── routes/              # Modular REST API route handlers
│   │   └── testIntegration.ts   # Automated database test suite
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── api/client.ts        # Typed HTTP client & endpoints
│   │   ├── context/AuthContext  # Session state & role permissions
│   │   ├── components/          # Reusable UI (DataTable, Modal, StatCard, Badge)
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── dashboards/      # Role-specific tailored dashboards
│   │   │   ├── StudentsPage.tsx
│   │   │   ├── FacultyPage.tsx
│   │   │   ├── AcademicsPage.tsx
│   │   │   ├── FeesPage.tsx
│   │   │   ├── LibraryPage.tsx
│   │   │   ├── HostelPage.tsx
│   │   │   ├── LeavesPage.tsx
│   │   │   └── DatabaseManagementPage.tsx
│   │   └── types.ts             # TypeScript entity definitions
│   ├── package.json
│   └── vite.config.ts
│
├── database/
│   ├── schema.sql               # Pure MySQL 8.0 DDL script
│   └── db_setup_instructions.md # MySQL configuration guide
└── uploads/                     # Documents, notes, and attachments
```

---

## ⚡ Quick Start Guide

### Step 1: Install Dependencies
Open two terminals or command prompts:

**Terminal 1 (Backend):**
```bash
cd backend
npm install
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
```

---

### Step 2: Database Migration & Seeding
From the `backend` folder:

```bash
cd backend

# Synchronize database schema and generate Prisma client
npx prisma db push

# Seed initial demonstration accounts, courses, marks, and facilities
npx tsx prisma/seed.ts
```

---

### Step 3: Run the Application

**Run Backend API Server (Port 5000):**
```bash
cd backend
npm run dev
```

**Run Frontend Development Server (Port 5173):**
```bash
cd frontend
npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

## 🔑 Default Login Credentials

Use the **1-Click Quick Demo Login** buttons on the login page or enter manually:

| Role | Email | Password | Access Highlights |
|---|---|---|---|
| **Admin** | `admin@college.com` | `Admin@123` | Full system access, database center, user management, audit logs |
| **Faculty** | `faculty@college.com` | `Faculty@123` | Mark attendance, enter marks, class timetable, approve leaves |
| **Student** | `student@college.com` | `Student@123` | Attendance %, marks overview, fee dues & payment, apply leave |
| **Staff** | `staff@college.com` | `Staff@123` | Issue/return library books, hostel rooms, record fee payments |

---

## 🗄️ How to Add New Tables or Fields Later

CampusConnect is structured for simple database evolution with **Prisma ORM**:

1. Open `backend/prisma/schema.prisma`.
2. Add your new field or table. For example, to add `bloodGroup` to `Student`:
   ```prisma
   model Student {
     // ... existing fields ...
     bloodGroup String?
   }
   ```
3. Run the schema sync command:
   ```bash
   cd backend
   npx prisma db push
   ```
4. Prisma Client regenerates automatically with complete TypeScript type safety!

---

## 🔄 Switching to MySQL 8.0 (Production Mode)

1. Ensure MySQL is running on your machine or cloud host.
2. In `backend/.env`, set your connection string:
   ```env
   DATABASE_URL="mysql://root:your_password@localhost:3306/campusconnect"
   ```
3. Push the schema to MySQL:
   ```bash
   cd backend
   npx prisma db push --schema=prisma/schema.mysql.prisma
   ```
4. Seed the MySQL database:
   ```bash
   npx tsx prisma/seed.ts
   ```

---

## 🧪 Verification & Testing

To run the automated database integration and transaction verification test:
```bash
cd backend
npx tsx src/testIntegration.ts
```
Expected output:
```
✔ Admin authentication verified (admin@college.com)
✔ Student authentication verified (Alex Rivera, Roll: 2024CS001)
✔ Faculty authentication verified (Dr. Alan Turing, ID: FAC-001)
✔ Staff authentication verified (Eleanor Vance, Role: STAFF)
✔ CREATE, READ, UPDATE, and DELETE Student records verified
✔ Attendance logging and cleanup verified
✔ Library issue and return transactions verified
✔ Audit trail logging verified
🎉 ALL INTEGRATION & DATABASE TESTS PASSED WITH 100% SUCCESS!
```
