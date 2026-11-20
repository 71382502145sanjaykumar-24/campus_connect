import { db } from '../firebaseAdmin';
import { AttendanceRecord } from '../types/schema';
import { generateAttendanceDocId } from '../utils/validators';
import { AuditService } from './auditService';

export class AttendanceService {
  private static collection = db.collection('attendance');

  /**
   * Log attendance for a student session.
   * Guarantees deduplication across (studentId, subjectId, date, hour)
   * through deterministic document ID and Firestore atomic transactions.
   */
  static async markAttendance(
    recordData: Omit<AttendanceRecord, 'attendanceId' | 'createdAt' | 'updatedAt'>,
    operatorUserId?: string
  ): Promise<AttendanceRecord> {
    const docId = generateAttendanceDocId(
      recordData.studentId,
      recordData.subjectId,
      recordData.date,
      recordData.hour
    );
    const docRef = this.collection.doc(docId);
    const now = new Date().toISOString();

    const savedRecord = await db.runTransaction(async (tx) => {
      const existing = await tx.get(docRef);

      const record: AttendanceRecord = {
        ...recordData,
        attendanceId: docId,
        createdAt: existing.exists ? existing.data()!.createdAt : now,
        updatedAt: now,
      };

      tx.set(docRef, record);
      return record;
    });

    await AuditService.recordLog({
      userId: operatorUserId || recordData.facultyId || 'System',
      userRole: 'Faculty',
      actionType: 'ATTENDANCE_LOG',
      collectionName: 'attendance',
      documentId: docId,
      updatedData: {
        studentId: recordData.studentId,
        status: recordData.attendanceStatus,
        date: recordData.date,
        hour: recordData.hour,
      },
    });

    return savedRecord;
  }

  /**
   * Bulk mark attendance for a class session.
   */
  static async markBatchAttendance(
    entries: Omit<AttendanceRecord, 'attendanceId' | 'createdAt' | 'updatedAt'>[],
    operatorUserId?: string
  ): Promise<{ savedCount: number; documentIds: string[] }> {
    const batch = db.batch();
    const docIds: string[] = [];
    const now = new Date().toISOString();

    for (const entry of entries) {
      const docId = generateAttendanceDocId(entry.studentId, entry.subjectId, entry.date, entry.hour);
      const docRef = this.collection.doc(docId);
      const record: AttendanceRecord = {
        ...entry,
        attendanceId: docId,
        createdAt: now,
        updatedAt: now,
      };
      batch.set(docRef, record);
      docIds.push(docId);
    }

    await batch.commit();

    await AuditService.recordLog({
      userId: operatorUserId || 'Faculty',
      userRole: 'Faculty',
      actionType: 'ATTENDANCE_LOG',
      collectionName: 'attendance',
      documentId: `BATCH_${Date.now()}`,
      updatedData: { count: entries.length },
    });

    return { savedCount: entries.length, documentIds: docIds };
  }

  static async getStudentAttendance(studentId: string, limitCount = 100): Promise<AttendanceRecord[]> {
    const snap = await this.collection
      .where('studentId', '==', studentId)
      .orderBy('date', 'desc')
      .limit(limitCount)
      .get();
    return snap.docs.map((d) => d.data() as AttendanceRecord);
  }

  static async getSubjectAttendance(subjectId: string, date: string): Promise<AttendanceRecord[]> {
    const snap = await this.collection
      .where('subjectId', '==', subjectId)
      .where('date', '==', date)
      .get();
    return snap.docs.map((d) => d.data() as AttendanceRecord);
  }
}
