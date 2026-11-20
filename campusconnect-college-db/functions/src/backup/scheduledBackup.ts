import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * Scheduled Cloud Function (Cron: Every Sunday at 02:00 AM UTC).
 * Automatically triggers Firestore collection exports to Google Cloud Storage bucket.
 */
export const scheduledFirestoreBackup = functions.pubsub
  .schedule('0 2 * * 0')
  .timeZone('UTC')
  .onRun(async (context) => {
    const client = new admin.firestore.v1.FirestoreAdminClient();
    const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT || 'campusconnect-college-db';
    const databaseName = client.databasePath(projectId, '(default)');
    const bucket = `gs://${projectId}-backups`;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputUriPrefix = `${bucket}/firestore-backups/${timestamp}`;

    try {
      const [response] = await client.exportDocuments({
        name: databaseName,
        outputUriPrefix,
        collectionIds: [], // Empty exports all collections
      });

      console.log(`Automated Firestore Backup initiated: ${response.name}`);

      await admin.firestore().collection('audit_logs').add({
        userId: 'CloudScheduler',
        userRole: 'System',
        actionType: 'DATA_EXPORT',
        collectionName: 'ALL_COLLECTIONS',
        documentId: response.name || timestamp,
        details: `Automated scheduled backup to ${outputUriPrefix}`,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Automated Firestore backup failed:', err);
    }
  });
