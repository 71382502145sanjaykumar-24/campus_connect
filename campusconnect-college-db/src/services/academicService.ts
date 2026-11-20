import { db } from '../firebaseAdmin';
import { AcademicRecord } from '../types/schema';
import { calculateGrade } from '../utils/validators';
import { AuditService } from './auditService';

export class AcademicService {
  private static collection = db.collection('academic_records');

  static async recordMarks(params: {
    studentId: string;
    subjectId: string;
    semester: number;
    internalMarks: number;
    assignmentMarks: number;
    practicalMarks?: number;
    academicYear: string;
    operatorUserId?: string;
  }): Promise<AcademicRecord> {
    const totalMarks = Math.min(
      100,
      params.internalMarks + params.assignmentMarks + (params.practicalMarks || 0)
    );
    const grade = calculateGrade(totalMarks);

    const docId = `MARK_${params.studentId}_${params.subjectId}_SEM${params.semester}`;
    const docRef = this.collection.doc(docId);
    const now = new Date().toISOString();

    const record: AcademicRecord = {
      recordId: docId,
      studentId: params.studentId,
      subjectId: params.subjectId,
      semester: params.semester,
      internalMarks: params.internalMarks,
      assignmentMarks: params.assignmentMarks,
      practicalMarks: params.practicalMarks,
      totalMarks,
      grade,
      academicYear: params.academicYear,
      createdAt: now,
      updatedAt: now,
    };

    await docRef.set(record);

    await AuditService.recordLog({
      userId: params.operatorUserId || 'Faculty',
      userRole: 'Faculty',
      actionType: 'MARKS_ALTER',
      collectionName: 'academic_records',
      documentId: docId,
      updatedData: { totalMarks, grade, studentId: params.studentId },
    });

    return record;
  }

  static async getStudentMarks(studentId: string): Promise<AcademicRecord[]> {
    const snap = await this.collection
      .where('studentId', '==', studentId)
      .orderBy('semester', 'asc')
      .get();
    return snap.docs.map((d) => d.data() as AcademicRecord);
  }
}
