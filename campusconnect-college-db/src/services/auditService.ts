import { db } from '../firebaseAdmin';
import { AuditLogRecord, UserRole } from '../types/schema';

export class AuditService {
  private static collectionName = 'audit_logs';

  /**
   * Append an immutable audit log record.
   * Direct writes from client SDKs are disabled in firestore.rules;
   * this runs exclusively via trusted server/Admin SDK.
   */
  static async recordLog(params: {
    userId: string;
    userRole: UserRole | 'System';
    actionType: AuditLogRecord['actionType'];
    collectionName: string;
    documentId: string;
    previousData?: Record<string, any>;
    updatedData?: Record<string, any>;
    ipAddress?: string;
  }): Promise<string> {
    const docRef = db.collection(this.collectionName).doc();
    const entry: AuditLogRecord = {
      logId: docRef.id,
      userId: params.userId,
      userRole: params.userRole,
      actionType: params.actionType,
      collectionName: params.collectionName,
      documentId: params.documentId,
      previousData: params.previousData,
      updatedData: params.updatedData,
      ipAddress: params.ipAddress || '127.0.0.1',
      timestamp: new Date().toISOString(),
    };

    await docRef.set(entry);
    return docRef.id;
  }

  static async getLogs(limitCount = 100, collectionFilter?: string): Promise<AuditLogRecord[]> {
    let query = db.collection(this.collectionName).orderBy('timestamp', 'desc');

    if (collectionFilter) {
      query = query.where('collectionName', '==', collectionFilter);
    }

    const snapshot = await query.limit(limitCount).get();
    return snapshot.docs.map((d) => d.data() as AuditLogRecord);
  }
}
