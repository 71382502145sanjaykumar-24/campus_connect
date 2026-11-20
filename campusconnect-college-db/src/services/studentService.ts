import { db } from '../firebaseAdmin';
import { StudentRecord } from '../types/schema';
import { generateStudentDocId } from '../utils/validators';
import { AuditService } from './auditService';

export class StudentService {
  private static collection = db.collection('students');

  /**
   * Create a student record.
   * Enforces Register Number uniqueness using an atomic Firestore transaction.
   */
  static async createStudent(
    studentData: Omit<StudentRecord, 'studentId' | 'createdAt' | 'updatedAt'>,
    operatorUserId?: string
  ): Promise<StudentRecord> {
    const docId = generateStudentDocId(studentData.registerNumber);
    const docRef = this.collection.doc(docId);

    const now = new Date().toISOString();

    const createdRecord = await db.runTransaction(async (transaction) => {
      // 1. Uniqueness check for registerNumber
      const existingDoc = await transaction.get(docRef);
      if (existingDoc.exists) {
        throw new Error(`Duplicate Error: Student with Register Number '${studentData.registerNumber}' already exists.`);
      }

      // 2. Double-check secondary index query across collection
      const dupQuery = await transaction.get(
        this.collection.where('registerNumber', '==', studentData.registerNumber).limit(1)
      );
      if (!dupQuery.empty) {
        throw new Error(`Duplicate Error: Student with Register Number '${studentData.registerNumber}' is already registered.`);
      }

      const record: StudentRecord = {
        ...studentData,
        studentId: docId,
        createdAt: now,
        updatedAt: now,
      };

      transaction.set(docRef, record);
      return record;
    });

    await AuditService.recordLog({
      userId: operatorUserId || 'System',
      userRole: 'Administrator',
      actionType: 'DATA_IMPORT',
      collectionName: 'students',
      documentId: docId,
      updatedData: { registerNumber: createdRecord.registerNumber, name: createdRecord.fullName },
    });

    return createdRecord;
  }

  static async getStudent(studentId: string): Promise<StudentRecord | null> {
    const snap = await this.collection.doc(studentId).get();
    if (!snap.exists) return null;
    return snap.data() as StudentRecord;
  }

  static async getStudentByUid(uid: string): Promise<StudentRecord | null> {
    const snap = await this.collection.where('uid', '==', uid).limit(1).get();
    if (snap.empty) return null;
    return snap.docs[0].data() as StudentRecord;
  }

  static async updateStudent(
    studentId: string,
    updates: Partial<StudentRecord>,
    operatorUserId?: string
  ): Promise<void> {
    const ref = this.collection.doc(studentId);
    const prev = (await ref.get()).data();

    // Prevent changing registerNumber to an existing one without validation
    if (updates.registerNumber && updates.registerNumber !== prev?.registerNumber) {
      const existing = await this.collection
        .where('registerNumber', '==', updates.registerNumber)
        .limit(1)
        .get();
      if (!existing.empty && existing.docs[0].id !== studentId) {
        throw new Error(`Register Number '${updates.registerNumber}' is already assigned to another student.`);
      }
    }

    const payload = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await ref.update(payload);

    await AuditService.recordLog({
      userId: operatorUserId || 'System',
      userRole: 'Administrator',
      actionType: 'USER_UPDATE',
      collectionName: 'students',
      documentId: studentId,
      previousData: prev,
      updatedData: payload,
    });
  }

  static async deleteStudent(studentId: string, operatorUserId?: string): Promise<void> {
    const ref = this.collection.doc(studentId);
    const prev = (await ref.get()).data();
    await ref.delete();

    await AuditService.recordLog({
      userId: operatorUserId || 'System',
      userRole: 'Administrator',
      actionType: 'USER_DELETE',
      collectionName: 'students',
      documentId: studentId,
      previousData: prev,
    });
  }

  static async listStudents(filter?: {
    departmentId?: string;
    year?: number;
    semester?: number;
    section?: string;
  }): Promise<StudentRecord[]> {
    let query: FirebaseFirestore.Query = this.collection;

    if (filter?.departmentId) {
      query = query.where('departmentId', '==', filter.departmentId);
    }
    if (filter?.year) {
      query = query.where('year', '==', filter.year);
    }
    if (filter?.semester) {
      query = query.where('semester', '==', filter.semester);
    }
    if (filter?.section) {
      query = query.where('section', '==', filter.section);
    }

    const snap = await query.get();
    return snap.docs.map((d) => d.data() as StudentRecord);
  }
}
