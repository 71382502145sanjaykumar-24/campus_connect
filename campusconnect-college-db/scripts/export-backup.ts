import * as fs from 'fs';
import * as path from 'path';
import { db } from '../src/firebaseAdmin';

/**
 * Backup Script: Exports all Firestore collections to structured JSON and CSV files.
 */
async function runExport() {
  console.log('📦 Starting Firestore Database Backup Export...');

  const backupDir = path.resolve(__dirname, '../backups', `backup_${Date.now()}`);
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const collections = [
    'departments',
    'users',
    'students',
    'faculty',
    'courses',
    'subjects',
    'attendance',
    'academic_records',
    'timetables',
    'assignments',
    'events',
    'library_books',
    'audit_logs',
  ];

  const summary: Record<string, number> = {};

  for (const colName of collections) {
    try {
      const snap = await db.collection(colName).get();
      const records = snap.docs.map((d) => ({ _id: d.id, ...d.data() }));

      const jsonPath = path.join(backupDir, `${colName}.json`);
      fs.writeFileSync(jsonPath, JSON.stringify(records, null, 2), 'utf8');

      // Export CSV if rows exist
      if (records.length > 0) {
        const firstRecord = records[0] as Record<string, any>;
        const headers = Object.keys(firstRecord).filter((k) => typeof firstRecord[k] !== 'object');
        const csvRows = [headers.join(',')];
        for (const row of records) {
          const rowObj = row as Record<string, any>;
          const vals = headers.map((h) => {
            const v = String(rowObj[h] ?? '').replace(/"/g, '""');
            return `"${v}"`;
          });
          csvRows.push(vals.join(','));
        }
        const csvPath = path.join(backupDir, `${colName}.csv`);
        fs.writeFileSync(csvPath, csvRows.join('\n'), 'utf8');
      }

      summary[colName] = records.length;
      console.log(`  ✅ Exported '${colName}': ${records.length} records`);
    } catch (err: any) {
      console.warn(`  ⚠️ Could not export '${colName}': ${err.message}`);
    }
  }

  const metaPath = path.join(backupDir, 'backup_metadata.json');
  fs.writeFileSync(
    metaPath,
    JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        backupDir,
        summary,
      },
      null,
      2
    ),
    'utf8'
  );

  console.log(`\n🎉 Backup Export Completed Successfully! Stored at: ${backupDir}`);
}

runExport().catch((err) => {
  console.error('❌ Export failed:', err);
  process.exit(1);
});
