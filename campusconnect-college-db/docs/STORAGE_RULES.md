# CampusConnect Firebase Storage Rules & Directory Hierarchy

## 1. Storage Bucket Architecture

CampusConnect manages documents, identity photos, transcripts, and course content using Google Cloud Storage for Firebase.

```
/
├── student_profiles/{userId}/{fileName}         (Max 5MB, Image types only)
├── faculty_profiles/{userId}/{fileName}         (Max 5MB, Image types only)
├── student_certificates/{userId}/{fileName}     (Max 10MB, PDF/PNG/JPEG)
├── student_resumes/{userId}/{fileName}          (Max 5MB, PDF only)
├── assignment_files/{subjectId}/{fileName}      (Max 25MB, PDF/DOCX/ZIP - Faculty only write)
├── assignment_submissions/{assignmentId}/{studentId}/{fileName} (Max 20MB, PDF/ZIP - Student write)
├── event_attachments/{eventId}/{fileName}       (Max 15MB, Image/PDF - Faculty/Admin write)
├── complaint_attachments/{userId}/{fileName}    (Max 10MB, Image/PDF - Owner write)
└── college_documents/{fileName}                 (Max 50MB, PDF - Admin only write)
```

---

## 2. Security Rules (`storage.rules`) Enforcement

### A. Authentication & Ownership Verification
- Every upload requires an authenticated session (`request.auth != null`).
- Users can only upload or delete files within their own `{userId}` directory path:
  ```javascript
  match /student_profiles/{userId}/{fileName} {
    allow read: if isAuthenticated();
    allow write: if isOwner(userId) && isImageFile() && request.resource.size <= 5 * 1024 * 1024;
  }
  ```

### B. MIME Type Filtering
- **Image validation:** Content type must match `image/.*`.
- **Document validation:** Must match `application/pdf`, Microsoft Word format, or compressed archives.
- Prevents malicious executable scripts (`.exe`, `.sh`, `.bat`, `.js`, `.html`) from being uploaded and served.

### C. Size Quotas
- Profile images capped at **5MB**.
- Student resumes capped at **5MB** (strictly PDF).
- Certificates and grievances capped at **10MB**.
- Assignment submissions capped at **20MB**.
- General official college circulars capped at **50MB**.

---

## 3. How to Deploy Storage Rules

```bash
firebase deploy --only storage
```
Rules take effect globally across all regions within seconds.
