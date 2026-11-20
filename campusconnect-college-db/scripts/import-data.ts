import * as fs from 'fs';
import * as path from 'path';
import { db } from '../src/firebaseAdmin';
import { StudentRecord } from '../src/types/schema';
import { generateStudentDocId, isValidEmail } from '../src/utils/validators';

/**
 * Validated CSV / JSON Data Importer for Students with Duplicate Detection.
 */
async function importData() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.log('Usage: npx tsx scripts/import-data.ts <path-to-csv-or-json>');
    console.log('Example: npx tsx scripts/import-data.ts ./sample_students.csv');
    return;
  }

  const resolved = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(resolved)) {
    console.error(`File not found: ${resolved}`);
    process.exit(1);
  }

  console.log(`📥 Reading input file: ${resolved}`);
  const content = fs.readFileSync(resolved, 'utf8');

  let rows: any[] = [];
  if (resolved.endsWith('.json')) {
    rows = JSON.parse(content);
  } else {
    // Parse CSV
    const lines = content.trim().split('\n');
    const headerLine = lines[0].toLowerCase();
    const hasHeader = headerLine.includes('roll') || headerLine.includes('reg');
    const startIndex = hasHeader ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const parts = lines[i].split(',').map((s) => s.trim().replace(/^"|"$/g, ''));
      if (parts.length >= 4) {
        rows.push({
          registerNumber: parts[0],
          fullName: parts[1],
          email: parts[2],
          departmentId: parts[3],
          year: parts[4] ? Number(parts[4]) : 1,
          semester: parts[5] ? Number(parts[5]) : 1,
          section: parts[6] || 'A',
          course: parts[7] || 'B.Tech Computer Science',
          phoneNumber: parts[8] || '',
        });
      }
    }
  }

  console.log(`  Parsed ${rows.length} rows. Validating before database insert...`);

  const results = {
    inserted: 0,
    skipped: 0,
    errors: [] as string[],
  };

  const batch = db.batch();
  const now = new Date().toISOString();

  for (let idx = 0; idx < rows.length; idx++) {
    const row = rows[idx];
    if (!row.registerNumber || !row.fullName || !row.email) {
      results.skipped++;
      results.errors.push(`Row ${idx + 1}: Missing registerNumber, fullName, or email`);
      continue;
    }

    if (!isValidEmail(row.email)) {
      results.skipped++;
      results.errors.push(`Row ${idx + 1}: Invalid email address '${row.email}'`);
      continue;
    }

    const docId = generateStudentDocId(row.registerNumber);
    const docRef = db.collection('students').doc(docId);

    // Duplicate check
    const existing = await docRef.get();
    if (existing.exists) {
      results.skipped++;
      results.errors.push(`Row ${idx + 1}: Register Number '${row.registerNumber}' already exists in database`);
      continue;
    }

    const studentRecord: StudentRecord = {
      studentId: docId,
      uid: `USR_${docId}`,
      registerNumber: row.registerNumber.trim().toUpperCase(),
      fullName: row.fullName.trim(),
      email: row.email.toLowerCase().trim(),
      phoneNumber: row.phoneNumber || undefined,
      departmentId: row.departmentId || 'DEPT_CSE',
      course: row.course || 'B.Tech Computer Science',
      year: Number(row.year) || 1,
      semester: Number(row.semester) || 1,
      section: row.section || 'A',
      admissionYear: 2024,
      academicStatus: 'Enrolled',
      skills: [],
      certifications: [],
      projects: [],
      achievements: [],
      createdAt: now,
      updatedAt: now,
    };

    batch.set(docRef, studentRecord);
    results.inserted++;
  }

  if (results.inserted > 0) {
    await batch.commit();
    console.log(`✅ Successfully committed ${results.inserted} validated records to Firestore!`);
  }

  if (results.skipped > 0) {
    console.warn(`⚠️ Skipped ${results.skipped} records due to validation / duplicate checks:`);
    results.errors.forEach((err) => console.warn(`   - ${err}`));
  }
}

importData().catch((err) => {
  console.error('❌ Import failed:', err);
  process.exit(1);
});
