# CampusConnect Existing Application Integration Guide

This guide details how to connect the existing application (React frontend or Express backend) to the new centralized `campusconnect-college-db` Firebase project.

---

## Option A: Direct React Frontend Integration (Client SDK)

The frontend can interact with Firestore directly using the modern Firebase Client SDK v10 (modular API), protected by `firestore.rules`.

### 1. Install Firebase Client SDK
In the frontend application:
```bash
cd frontend
npm install firebase
```

### 2. Configure Firebase Client Initialization (`frontend/src/firebase.ts`)
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "campusconnect-college-db.firebaseapp.com",
  projectId: "campusconnect-college-db",
  storageBucket: "campusconnect-college-db.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef..."
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

### 3. Subscribing to Real-Time Updates in React
```typescript
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export function useStudentAttendance(studentId: string) {
  const [attendance, setAttendance] = useState<any[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'attendance'),
      where('studentId', '==', studentId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAttendance(records);
    });

    return () => unsubscribe();
  }, [studentId]);

  return attendance;
}
```

---

## Option B: Node.js Express Backend Integration (Admin SDK)

If your architecture uses the existing Express server (`backend/`), it can seamlessly communicate with Firebase as an authoritative service.

### 1. Install Admin SDK in Backend
```bash
cd backend
npm install firebase-admin
```

### 2. Connect Express Routes to Firestore
```typescript
import * as admin from 'firebase-admin';

// Initialize with service account credentials
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'campusconnect-college-db',
  });
}

const firestore = admin.firestore();

// Example: Express route to read students from Firestore
app.get('/api/firestore/students', async (req, res) => {
  try {
    const snap = await firestore.collection('students').get();
    const students = snap.docs.map(doc => doc.data());
    res.json(students);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Option C: Dual-Write / Migration Mode

To run SQLite / MySQL in parallel with Firebase during a transition phase:
1. Write records to SQLite / MySQL via Prisma.
2. Synchronize the mutation to Firestore using `campusconnect-college-db/src/services/`.
3. Read from Firestore to power real-time dashboards and notifications.
