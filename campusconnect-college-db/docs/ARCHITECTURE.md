# CampusConnect Firebase Architecture Blueprint

## 1. System Overview

**CampusConnect** employs Google Firebase as a serverless, horizontally scalable, multi-tenant cloud database platform. The architecture separates client applications (web, mobile, administrative portals) from data storage and enforces access control via Firebase Authentication Custom Claims, Cloud Firestore Security Rules, and Firebase Cloud Functions.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          CLIENT ACCESS LAYER                                    │
│    (React Web Portal, Mobile Apps, Faculty Tablet UI, Staff Consoles)          │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │ HTTPS / WebSockets
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     FIREBASE AUTHENTICATION & CLAIMS                            │
│    • Email/Password, SSO & MFA                                                 │
│    • Custom Claims: { role: 'Faculty', departmentId: 'DEPT_CSE' }               │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │
                    ┌────────────────────┴───────────────────┐
                    ▼                                        ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────────────┐
│       FIRESTORE SECURITY RULES       │  │       STORAGE SECURITY RULES         │
│  • Role-Based Access Control (RBAC)  │  │  • MIME Type & Size Constraints      │
│  • Field-level mutation restrictions │  │  • User ownership directory locks    │
│  • Immutable Audit Log Protection    │  │  • 5MB - 25MB quotas                 │
└───────────────────┬──────────────────┘  └──────────────────┬───────────────────┘
                    │                                        │
                    ▼                                        ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────────────┐
│       CLOUD FIRESTORE DATABASE       │  │        CLOUD STORAGE BUCKET          │
│  • 17+ Normalized Collections        │  │  • /student_profiles/                │
│  • ACID Document Transactions        │  │  • /student_resumes/                 │
│  • Automatic Composite Indexes       │  │  • /assignment_submissions/         │
└───────────────────▲──────────────────┘  └──────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        TRUSTED SERVERLESS COMPUTE LAYER                         │
│                           (Firebase Cloud Functions)                            │
│  • onUserCreated: Automatic claims provisioning & audit initialization          │
│  • assignUserRole: Privileged role modifications strictly for Administrators    │
│  • onMarksUpdated: Real-time CGPA re-computation & grade aggregation           │
│  • scheduledFirestoreBackup: Automated GCS exports (Cron: Sundays 02:00 UTC)   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Pillars of the Architecture

### A. Cloud Firestore (NoSQL Document Store)
- **High Concurrency & Real-Time Sync:** Enables live grade alerts, attendance updates, and circular notifications using real-time listeners (`onSnapshot`).
- **Granular Security:** Enforced at the document and field level using declarative rules (`firestore.rules`).
- **Deterministic Keys for Deduplication:** Eliminates race conditions by utilizing deterministic keys for records requiring natural uniqueness (e.g., `STU_{registerNumber}`, `ATT_{studentId}_{subjectId}_{date}_{hour}`).

### B. Firebase Authentication & Custom Claims
- Authentication relies on Firebase Auth UIDs. Passwords are never stored or handled in plain text.
- To prevent repetitive Firestore lookups during security rule evaluations, trusted user roles and department affiliations are embedded directly in the JWT token as Custom User Claims:
  ```json
  {
    "role": "Faculty",
    "departmentId": "DEPT_CSE"
  }
  ```

### C. Trusted Cloud Functions (Server-Side)
- All privileged operations (such as user role assignment, register number verification, and grade computations) execute in isolated Node.js Cloud Functions with the Firebase Admin SDK.
- Direct client writes to sensitive collections like `audit_logs` are blocked by security rules; writes must flow through serverless functions.

### D. Firebase Cloud Storage
- Files (resumes, assignment submissions, certificates, complaint attachments) are stored in Google Cloud Storage with strict path structures and file-type validation rules (`storage.rules`).
