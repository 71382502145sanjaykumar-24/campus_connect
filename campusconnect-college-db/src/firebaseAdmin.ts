import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config();

let initializedApp: admin.app.App;

/**
 * Initialize Firebase Admin SDK singleton.
 * Uses service account JSON key if available, otherwise falls back to Application Default Credentials
 * or Local Firebase Emulators.
 */
export function getFirebaseAdmin(): admin.app.App {
  if (initializedApp) {
    return initializedApp;
  }

  if (admin.apps.length > 0) {
    initializedApp = admin.apps[0]!;
    return initializedApp;
  }

  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './serviceAccountKey.json';
  const resolvedPath = path.resolve(process.cwd(), serviceAccountPath);

  if (fs.existsSync(resolvedPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
    initializedApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`,
      projectId: serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID || 'campusconnect-college-db',
    });
  } else {
    // Application Default Credentials or Emulator mode
    initializedApp = admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'campusconnect-college-db',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'campusconnect-college-db.appspot.com',
    });
  }

  return initializedApp;
}

export const adminApp = getFirebaseAdmin();
export const db = admin.firestore(adminApp);
export const auth = admin.auth(adminApp);
export const storage = admin.storage(adminApp);

// Configure Firestore settings
db.settings({
  ignoreUndefinedProperties: true,
});
