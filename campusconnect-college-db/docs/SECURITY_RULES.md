# CampusConnect Firestore Security Rules Documentation

## 1. Security Architecture & Threat Model

The `firestore.rules` file enforces zero-trust data access control. Every request is verified for:
1. **Authentication:** The user must possess a valid, non-expired Firebase ID token (`request.auth != null`).
2. **Role Verification:** Verified via Custom User Claims (`request.auth.token.role`) or document fallback.
3. **Field Whitelisting:** Prevents users from updating unauthorized or privileged fields (e.g. role, marks, attendance, registerNumber).
4. **Tenant/Department Isolation:** HODs can only modify resources matching their assigned `departmentId`.
5. **No Public Read/Write:** No collection permits unauthenticated or open public read or write access.

---

## 2. Role-Based Access Control (RBAC) Matrix

| Collection | Student | Faculty | HOD | Administrator | Placement Officer | Librarian | Staff |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `users` | Read self, Update self (profile/phone) | Read self, Update self | Read dept, Update self | Full CRUD | Read self, Update self | Read self, Update self | Read self, Update self |
| `students` | Read self, Update permitted fields | Read assigned, Update academic | Read dept, Update dept | Full CRUD | Read eligible | Read basic (roll/name) | Read basic |
| `faculty` | Read basic | Read all, Update self | Read dept, Update dept | Full CRUD | Read all | Read all | Read all |
| `departments` | Read | Read | Read, Update own dept | Full CRUD | Read | Read | Read |
| `attendance` | Read self | Create, Read, Update assigned | Full dept CRUD | Full CRUD | Read | No Access | Read basic |
| `academic_records`| Read self | Create, Read, Update assigned | Full dept CRUD | Full CRUD | Read verified | No Access | No Access |
| `courses` & `subjects`| Read | Read | Create, Update dept | Full CRUD | Read | Read | Read |
| `assignments` | Read assigned | Create, Read, Update, Delete | Full dept CRUD | Full CRUD | Read | No Access | No Access |
| `submissions` | Create self, Read self, Update self (pre-deadline)| Read assigned, Grade | Read dept | Full CRUD | No Access | No Access | No Access |
| `events` | Read, Register | Create, Update | Full dept CRUD | Full CRUD | Read, Create | Read | Read |
| `placements` | Read open, Apply | Read | Read | Full CRUD | Full CRUD | Read | Read |
| `library_books` | Read catalog | Read catalog | Read catalog | Full CRUD | Read catalog | Full CRUD | Read catalog |
| `book_transactions`| Read self | Read self | Read self | Full CRUD | No Access | Full CRUD | Read loans |
| `hostels` | Read assigned | No Access | Read | Full CRUD | No Access | No Access | Full CRUD |
| `audit_logs` | **No Access** | **No Access** | **No Access** | **Read Only** | **No Access** | **No Access** | **No Access** |

---

## 3. Defense Against Privilege Escalation

Users registering through public client SDKs cannot grant themselves elevated roles.

```javascript
// Rule in firestore.rules
match /users/{userId} {
  allow create: if isAuthenticated() && request.auth.uid == userId && (
    request.resource.data.role in ['Student', 'Faculty', 'Staff'] &&
    request.resource.data.accountStatus == 'Active' &&
    request.resource.data.uid == userId
  ) || isAdmin();

  allow update: if (
    isOwner(userId) && 
    !request.resource.data.diff(resource.data).affectedKeys()
      .hasAny(['role', 'accountStatus', 'uid', 'email'])
  ) || isAdmin();
}
```

- **Protection 1:** Setting `role` to `Administrator` or `HOD` on client creation is rejected.
- **Protection 2:** On document update, `diff().affectedKeys()` blocks users from modifying `role`, `accountStatus`, `uid`, or `email`.
- **Protection 3:** Privileged role upgrades must go through the trusted HTTPS callable function `assignUserRole`, which validates that the caller is an authenticated Administrator.
