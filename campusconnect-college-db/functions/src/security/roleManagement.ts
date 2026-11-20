import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Callable HTTPS Function: Trusted server-side role assignment.
 * Strictly verifies that caller is an Administrator before modifying roles.
 */
export const assignUserRole = functions.https.onCall(async (data, context) => {
  // 1. Verify caller authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required to execute role management.'
    );
  }

  // 2. Verify caller has Administrator privilege
  const callerClaims = context.auth.token;
  if (callerClaims.role !== 'Administrator') {
    const callerDoc = await db.collection('users').doc(context.auth.uid).get();
    if (callerDoc.data()?.role !== 'Administrator') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only Administrators can assign or alter user roles.'
      );
    }
  }

  const { targetUid, newRole, departmentId } = data;
  const validRoles = [
    'Student',
    'Faculty',
    'HOD',
    'Administrator',
    'Placement Officer',
    'Librarian',
    'Staff',
  ];

  if (!targetUid || !validRoles.includes(newRole)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid target UID or role specified.');
  }

  // 3. Update Custom Claims on Firebase Auth
  await admin.auth().setCustomUserClaims(targetUid, {
    role: newRole,
    departmentId: departmentId || null,
  });

  // 4. Update Firestore User Document
  await db.collection('users').doc(targetUid).update({
    role: newRole,
    departmentId: departmentId || null,
    updatedAt: new Date().toISOString(),
  });

  // 5. Append Immutable Audit Log
  await db.collection('audit_logs').add({
    userId: context.auth.uid,
    userRole: 'Administrator',
    actionType: 'PERMISSION_CHANGE',
    collectionName: 'users',
    documentId: targetUid,
    details: `Role updated to ${newRole} for user ${targetUid}`,
    timestamp: new Date().toISOString(),
  });

  return { success: true, message: `Role successfully updated to ${newRole}` };
});
