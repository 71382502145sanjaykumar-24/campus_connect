"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onMarksUpdated = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const db = admin.firestore();
/**
 * Triggered whenever an academic record is created or updated.
 * Automatically recalculates the cumulative CGPA for the student.
 */
exports.onMarksUpdated = functions.firestore
    .document('academic_records/{recordId}')
    .onWrite(async (change, context) => {
    const data = change.after.exists ? change.after.data() : null;
    if (!data)
        return; // Deleted
    const studentId = data.studentId;
    if (!studentId)
        return;
    // Fetch all academic records for this student
    const allRecordsSnap = await db
        .collection('academic_records')
        .where('studentId', '==', studentId)
        .get();
    if (allRecordsSnap.empty)
        return;
    let totalScore = 0;
    let count = 0;
    allRecordsSnap.forEach((doc) => {
        const rec = doc.data();
        if (typeof rec.totalMarks === 'number') {
            totalScore += rec.totalMarks;
            count++;
        }
    });
    if (count > 0) {
        // 10-point scale CGPA
        const cgpa = Number(((totalScore / (count * 100)) * 10).toFixed(2));
        // Update student profile
        await db.collection('students').doc(studentId).update({
            cgpa,
            updatedAt: new Date().toISOString(),
        });
    }
});
//# sourceMappingURL=calculateGrades.js.map