/**
 * CampusConnect Centralized Firebase Cloud Functions
 * Root exports for background triggers, trusted security endpoints, and backups.
 */

export { onUserCreated } from './auth/onUserCreated';
export { assignUserRole } from './security/roleManagement';
export { onMarksUpdated } from './academics/calculateGrades';
export { scheduledFirestoreBackup } from './backup/scheduledBackup';
