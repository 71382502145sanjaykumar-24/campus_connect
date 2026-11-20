# CampusConnect Firestore Indexes Configuration

## 1. Indexing Overview

Cloud Firestore automatically indexes individual fields. However, complex compound queries—such as filtering by department and sorting by semester, or querying attendance by student across dates—require **composite indexes**.

All necessary composite indexes are pre-configured in `firestore.indexes.json`.

---

## 2. Defined Composite Indexes

### 1. Student Queries
```json
{
  "collectionGroup": "students",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "departmentId", "order": "ASCENDING" },
    { "fieldPath": "year", "order": "ASCENDING" },
    { "fieldPath": "fullName", "order": "ASCENDING" }
  ]
}
```
*Supports:* Listing all students in Computer Science ordered by year and name for administrative rosters.

---

### 2. Student Section Queries
```json
{
  "collectionGroup": "students",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "departmentId", "order": "ASCENDING" },
    { "fieldPath": "semester", "order": "ASCENDING" },
    { "fieldPath": "section", "order": "ASCENDING" }
  ]
}
```
*Supports:* Generating classroom attendance rosters for a given semester and section.

---

### 3. Student Attendance History
```json
{
  "collectionGroup": "attendance",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "studentId", "order": "ASCENDING" },
    { "fieldPath": "date", "order": "DESCENDING" }
  ]
}
```
*Supports:* Student portal attendance timeline query displaying recent attendance records.

---

### 4. Subject Attendance Verification
```json
{
  "collectionGroup": "attendance",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "subjectId", "order": "ASCENDING" },
    { "fieldPath": "date", "order": "DESCENDING" }
  ]
}
```
*Supports:* Faculty reviewing attendance for their subject across lecture dates.

---

### 5. Academic Marks by Semester
```json
{
  "collectionGroup": "academic_records",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "studentId", "order": "ASCENDING" },
    { "fieldPath": "semester", "order": "ASCENDING" }
  ]
}
```
*Supports:* Student grade sheet generation and semester-wise GPA progression calculation.

---

### 6. Event Deadlines & Status
```json
{
  "collectionGroup": "events",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "eventDate", "order": "ASCENDING" }
  ]
}
```
*Supports:* Listing upcoming events chronologically on student and faculty dashboards.

---

### 7. Placement Drives by Deadline
```json
{
  "collectionGroup": "placements",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "applicationDeadline", "order": "ASCENDING" }
  ]
}
```
*Supports:* Placement portal active drives filtered by deadline.

---

### 8. Audit Log Chronological Queries
```json
{
  "collectionGroup": "audit_logs",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "collectionName", "order": "ASCENDING" },
    { "fieldPath": "timestamp", "order": "DESCENDING" }
  ]
}
```
*Supports:* Filtering audit logs by collection (e.g. `academic_records`) in reverse chronological order.

---

## 3. How to Deploy Indexes

Deploy all indexes to the active Firebase project using the Firebase CLI:
```bash
firebase deploy --only firestore:indexes
```
The Firebase Console will compile and build the indexes automatically in the background.
