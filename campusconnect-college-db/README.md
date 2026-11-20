# CampusConnect – Centralized College Management Firebase Database Project

A dedicated, scalable, enterprise-grade Google Firebase database project architected for **CampusConnect – Smart College Management & Student Utility Platform**.

---

## 📁 Project Directory Layout

```
campusconnect-college-db/
├── firebase.json                   # Firebase CLI project configuration & emulator bindings
├── .firebaserc                     # Active Firebase project alias (campusconnect-college-db)
├── firestore.rules                 # Declarative, role-based Firestore Security Rules
├── firestore.indexes.json          # Composite indexes for multi-field filtering & sorting
├── storage.rules                   # Firebase Storage access control & file validation rules
├── package.json                    # Project dependencies, build scripts, seed & backup commands
├── tsconfig.json                   # TypeScript configuration
├── .env.example                    # Environment variable template
├── functions/                      # Firebase Cloud Functions (Serverless trusted compute)
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts                # Cloud Functions export manifest
│       ├── auth/
│       │   └── onUserCreated.ts    # Authentication trigger & initial claim provisioning
│       ├── academics/
│       │   └── calculateGrades.ts  # Grade calculation & automatic CGPA recomputation
│       ├── security/
│       │   └── roleManagement.ts   # Trusted callable function for admin role assignment
│       └── backup/
│           └── scheduledBackup.ts  # Automated weekly Firestore backup trigger
├── src/                            # Database Service & Domain Logic Layer
│   ├── firebaseAdmin.ts            # Firebase Admin SDK singleton initializer
│   ├── types/
│   │   └── schema.ts               # Complete TypeScript interfaces for all 17+ collections
│   ├── services/
│   │   ├── userService.ts          # User management & custom claims provisioning
│   │   ├── studentService.ts       # Student profiles with RegisterNumber uniqueness check
│   │   ├── attendanceService.ts    # Deduplicated attendance logging via atomic transactions
│   │   ├── academicService.ts      # Marks, grades, and academic records
│   │   ├── libraryService.ts       # Book inventory and atomic circulation transactions
│   │   └── auditService.ts         # Append-only, write-protected system audit trail
│   └── utils/
│       └── validators.ts           # Validation functions & deterministic docId generators
├── scripts/
│   ├── seed.ts                     # Database seeder across all collections (realistic mock data)
│   ├── verify-db.ts                # Automated database architecture verification test suite
│   ├── export-backup.ts            # Local JSON and CSV collection export utility
│   ├── import-data.ts              # Validated CSV importer with duplicate detection
│   └── migrate-from-sql.ts         # Migration pipeline from SQL/SQLite to Firestore
└── docs/                           # Comprehensive Engineering Documentation
    ├── ARCHITECTURE.md             # 1. System architecture & data flow diagrams
    ├── COLLECTIONS_SCHEMA.md       # 2. Detailed collections & field specifications
    ├── RELATIONSHIPS.md            # 3. Entity relationships & normalization decisions
    ├── SECURITY_RULES.md           # 4. RBAC security rules documentation & threat model
    ├── INDEXES.md                  # 5. Firestore composite indexes documentation
    ├── STORAGE_RULES.md            # 6. Firebase Storage paths, quotas & security rules
    ├── ENVIRONMENT_SETUP.md        # 7. Step-by-step Firebase Console setup guide
    ├── BACKUP_AND_RESTORE.md       # 8. Backup strategies & disaster recovery procedures
    └── INTEGRATION_GUIDE.md        # 9. Existing application integration guide (React & Node.js)
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and set your Firebase Project details:
```bash
cp .env.example .env
```
*(Place your `serviceAccountKey.json` in the project root if executing administrative scripts against live Firebase).*

### 3. Verify Database Architecture
Run the automated verification suite to test grade calculations, document keys, and collection schemas:
```bash
npm run verify
```

### 4. Seed Database with Realistic Data
Populate all collections with sample, non-PII records:
```bash
npm run seed
```

### 5. Export Database Backups
Export collections to JSON and CSV:
```bash
npm run export-data
```

### 6. Deploy to Firebase Cloud
Deploy security rules, indexes, and cloud functions to your live Firebase project:
```bash
# Deploy Rules & Indexes
npm run deploy:rules
npm run deploy:indexes

# Deploy Serverless Cloud Functions
npm run deploy:functions
```

---

## 🔒 Security Highlights

1. **Zero Public Access:** No collection permits unauthenticated access.
2. **Privilege Escalation Protection:** Users cannot promote themselves to `Administrator` or `HOD`.
3. **Immutable Audit Trail:** Direct client writes to `audit_logs` are forbidden by security rules. All audit events are written via trusted Cloud Functions or Firebase Admin SDK.
4. **Deterministic Uniqueness:** Student register numbers and attendance hours use deterministic keys (`STU_{registerNumber}`, `ATT_{studentId}_{subjectId}_{date}_H{hour}`) guaranteeing atomicity and eliminating duplicate entries.
