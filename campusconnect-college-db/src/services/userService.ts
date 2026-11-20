import { db, auth } from '../firebaseAdmin';
import { UserRecord, UserRole } from '../types/schema';
import { AuditService } from './auditService';

export class UserService {
  private static collection = db.collection('users');

  /**
   * Create a new user in Firebase Auth and synchronize with Firestore `users` collection.
   * Injects Custom Claims for role-based security rules.
   */
  static async createUser(params: {
    email: string;
    password?: string;
    fullName: string;
    role: UserRole;
    departmentId?: string;
    phoneNumber?: string;
    operatorUserId?: string;
  }): Promise<UserRecord> {
    // 1. Create in Firebase Authentication
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(params.email);
    } catch {
      userRecord = await auth.createUser({
        email: params.email,
        password: params.password || 'CampusConnect@2026',
        displayName: params.fullName,
        phoneNumber: params.phoneNumber ? (params.phoneNumber.startsWith('+') ? params.phoneNumber : undefined) : undefined,
      });
    }

    // 2. Set Custom Claims for fast token-based security rules checks
    await auth.setCustomUserClaims(userRecord.uid, {
      role: params.role,
      departmentId: params.departmentId || null,
    });

    // 3. Create document in Firestore `users` collection
    const now = new Date().toISOString();
    const docData: UserRecord = {
      uid: userRecord.uid,
      fullName: params.fullName,
      email: params.email.toLowerCase().trim(),
      phoneNumber: params.phoneNumber,
      role: params.role,
      departmentId: params.departmentId,
      accountStatus: 'Active',
      createdAt: now,
      updatedAt: now,
    };

    await this.collection.doc(userRecord.uid).set(docData);

    // 4. Log audit entry
    await AuditService.recordLog({
      userId: params.operatorUserId || 'System',
      userRole: 'Administrator',
      actionType: 'USER_CREATE',
      collectionName: 'users',
      documentId: userRecord.uid,
      updatedData: { email: docData.email, role: docData.role },
    });

    return docData;
  }

  static async getUser(uid: string): Promise<UserRecord | null> {
    const snap = await this.collection.doc(uid).get();
    if (!snap.exists) return null;
    return snap.data() as UserRecord;
  }

  static async updateUser(
    uid: string,
    updates: Partial<UserRecord>,
    operatorUserId?: string
  ): Promise<void> {
    const ref = this.collection.doc(uid);
    const prev = (await ref.get()).data();

    const payload = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await ref.update(payload);

    // If role changed, update Auth Custom Claims
    if (updates.role) {
      await auth.setCustomUserClaims(uid, {
        role: updates.role,
        departmentId: updates.departmentId || prev?.departmentId,
      });
    }

    await AuditService.recordLog({
      userId: operatorUserId || 'System',
      userRole: 'Administrator',
      actionType: 'USER_UPDATE',
      collectionName: 'users',
      documentId: uid,
      previousData: prev,
      updatedData: payload,
    });
  }

  static async listUsers(roleFilter?: UserRole): Promise<UserRecord[]> {
    let query = this.collection.orderBy('createdAt', 'desc');
    if (roleFilter) {
      query = query.where('role', '==', roleFilter);
    }
    const snap = await query.get();
    return snap.docs.map((d) => d.data() as UserRecord);
  }
}
