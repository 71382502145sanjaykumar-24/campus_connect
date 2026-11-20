# CampusConnect Database Setup & Migration Guide

This document outlines the database configuration for **CampusConnect – Smart College Management & Student Utility Platform**.

---

## 1. Relational Database Architecture

CampusConnect uses **Prisma ORM** with a normalized schema covering all college management domains:
- **Core Identities**: Users, Roles, Faculty, Students
- **Academics**: Departments, Courses, Subjects, Timetables, Examinations
- **Performance**: Attendance, Internal Marks, Semester Results, Assignments, Submissions
- **Campus Life**: Events, Registrations, Certificates, Placements, Internships, Applications
- **Infrastructure & Utilities**: Library Books, Book Transactions, Facilities (Hostel, Transport, Labs, Canteen), Service Requests, Grievances
- **Governance**: Announcements, Notifications, System Audit Logs

---

## 2. Using with MySQL 8.0 (Production / Dedicated Database)

To connect CampusConnect to your local or hosted MySQL instance:

1. **Create the Database in MySQL**:
   ```sql
   CREATE DATABASE campusconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **Configure your `.env` in `/backend`**:
   ```env
   DATABASE_URL="mysql://<user>:<password>@localhost:3306/campusconnect"
   ```

3. **Deploy the Prisma Schema to MySQL**:
   ```bash
   cd backend
   npx prisma db push --schema=prisma/schema.mysql.prisma
   ```

4. **Alternatively, execute the Raw SQL DDL**:
   ```bash
   mysql -u <user> -p campusconnect < ../database/schema.sql
   ```

5. **Seed Initial Demo Data**:
   ```bash
   cd backend
   npx tsx prisma/seed.ts
   ```

---

## 3. Instant Zero-Configuration SQLite Mode (Development / Offline)

For out-of-the-box operation without requiring an external MySQL daemon running, CampusConnect includes an embedded SQLite database configuration (`backend/dev.db`).

- Same models, same relations, same Prisma Client queries!
- Persistent across page reloads, logouts, and backend restarts.
- Run setup in one command:
  ```bash
  cd backend
  npm run setup
  ```

---

## 4. Default Seeded User Credentials

| Role | Email | Password | Identifier |
|------|-------|----------|------------|
| **Admin** | `admin@campusconnect.edu` | `Admin@123` | ADM-001 |
| **Faculty** | `faculty.cs@campusconnect.edu` | `Faculty@123` | FAC-2022-001 |
| **HOD** | `hod.cs@campusconnect.edu` | `Hod@123` | HOD-CSE |
| **Student** | `student.alex@campusconnect.edu` | `Student@123` | STU-2024-001 (2024CS001) |
| **Placement Officer**| `placement@campusconnect.edu` | `Placement@123` | TPO-001 |
| **Librarian** | `librarian@campusconnect.edu` | `Library@123` | LIB-001 |
| **Staff** | `staff.maintenance@campusconnect.edu`| `Staff@123` | STF-001 |
