"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onUserCreated = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const db = admin.firestore();
/**
 * Triggered whenever a new user is created in Firebase Authentication.
 * Initializes default user document and synchronizes role claims.
 */
exports.onUserCreated = functions.auth.user().onCreate(async (user) => {
    const email = (user.email || '').toLowerCase().trim();
    const uid = user.uid;
    // Check if a pre-provisioned user document already exists
    const userDocRef = db.collection('users').doc(uid);
    const userDoc = await userDocRef.get();
    let assignedRole = 'Student';
    if (userDoc.exists) {
        assignedRole = userDoc.data()?.role || 'Student';
    }
    else if (email === 'admin@college.com') {
        assignedRole = 'Administrator';
    }
    // Set Custom Claims for high-performance security rules
    await admin.auth().setCustomUserClaims(uid, {
        role: assignedRole,
    });
    if (!userDoc.exists) {
        await userDocRef.set({
            uid,
            email,
            fullName: user.displayName || 'CampusConnect Member',
            role: assignedRole,
            accountStatus: 'Active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
    }
    // Record immutable audit entry
    await db.collection('audit_logs').add({
        userId: uid,
        userRole: assignedRole,
        actionType: 'USER_CREATE',
        collectionName: 'users',
        documentId: uid,
        details: `Auth account initialized for ${email} with role ${assignedRole}`,
        timestamp: new Date().toISOString(),
    });
});
//# sourceMappingURL=onUserCreated.js.map