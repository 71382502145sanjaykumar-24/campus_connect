# CampusConnect Database Entity Relationships

## 1. Relational Paradigm in Cloud Firestore

While Firestore is a NoSQL document database, CampusConnect utilizes a **hybrid normalized document model** to ensure data integrity, prevent stale duplicates, and facilitate high-throughput concurrent writes.

```
┌─────────────────┐             1:N              ┌──────────────────┐
│   departments   ├─────────────────────────────►│     students     │
└────────┬────────┘                              └─────────┬────────┘
         │ 1:N                                             │ 1:N
         │                                                 ▼
         │        ┌──────────────────┐           ┌──────────────────┐
         ├───────►│     faculty      │           │    attendance    │
         │        └────────┬─────────┘           └──────────────────┘
         │ 1:N             │ 1:N                           ▲
         ▼                 ▼                               │ 1:N
┌─────────────────┐ 1:N   ┌──────────────────┐             │
│     courses     ├──────►│     subjects     ├─────────────┤
└─────────────────┘       └────────┬─────────┘             │
                                   │ 1:N                   │ 1:N
                                   ▼                       ▼
                          ┌──────────────────┐   ┌──────────────────┐
                          │   assignments    │   │ academic_records │
                          └────────┬─────────┘   └──────────────────┘
                                   │ 1:N
                                   ▼
                          ┌──────────────────┐
                          │   submissions    │
                          └──────────────────┘
```

---

## 2. Key Relationship Definitions

### 1. Departments ➔ Students (One-to-Many)
- Each student belongs to exactly one department (`departmentId`).
- A department contains hundreds of students.
- **Reference:** `students.departmentId` $\rightarrow$ `departments.departmentId`.

### 2. Departments ➔ Faculty (One-to-Many)
- Each faculty member is appointed to a department (`departmentId`).
- Department HOD is a faculty member referenced by `departments.hodId`.
- **Reference:** `faculty.departmentId` $\rightarrow$ `departments.departmentId`.

### 3. Faculty ➔ Subjects (One-to-Many)
- A faculty member can instruct multiple subjects across classes.
- **Reference:** `faculty.subjects` array contains `subjects.subjectId` values, and `subjects.assignedFacultyId` references `faculty.facultyId`.

### 4. Students ➔ Attendance (One-to-Many)
- A student accumulates attendance entries for every class hour attended.
- To prevent duplicate attendance marks, documents use the deterministic key:
  `ATT_{studentId}_{subjectId}_{date}_H{hour}`.

### 5. Students ➔ Academic Records (One-to-Many)
- Each academic record represents the student's internal and semester evaluation for a specific subject.
- **Reference:** `academic_records.studentId` $\rightarrow$ `students.studentId`, `academic_records.subjectId` $\rightarrow$ `subjects.subjectId`.

### 6. Assignments ➔ Submissions (One-to-Many)
- Faculty post assignments to `assignments`.
- Students upload their work to `submissions`.
- **Reference:** `submissions.assignmentId` $\rightarrow$ `assignments.assignmentId`.

### 7. Placements ➔ Applications (One-to-Many)
- Companies publish drives in `placements`.
- Eligible students apply through `applications`.
- **Reference:** `applications.placementId` $\rightarrow$ `placements.placementId`, `applications.studentId` $\rightarrow$ `students.studentId`.

### 8. Library Books ➔ Book Transactions (One-to-Many)
- Each book title in `library_books` tracks `totalCopies` and `availableCopies`.
- Active loans and past borrowing history are stored in `book_transactions`.
- **Reference:** `book_transactions.bookId` $\rightarrow$ `library_books.bookId`.

---

## 3. Denormalization vs. Referencing Trade-offs

| Strategy | When Applied | Justification |
|---|---|---|
| **Referencing (Normalized)** | Academic records, attendance, faculty assignments, applications | Ensures grade alterations, attendance marks, and profile edits reflect instantaneously without distributed updates. |
| **Controlled Denormalization** | Student full name & email stored on `students` alongside `uid` | Prevents requiring an extra read from `users` collection during roster generation and report downloads. |
| **Atomic Cascades** | Handled via Cloud Functions or Batch Transactions | When an entity is deleted (e.g. student), dependent records are soft-deleted or cleaned up asynchronously to maintain referential integrity. |
