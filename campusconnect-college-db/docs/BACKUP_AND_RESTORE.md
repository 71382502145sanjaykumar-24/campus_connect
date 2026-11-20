# CampusConnect Database Backup, Recovery & Disaster Management Guide

## 1. Automated Scheduled Cloud Backups

CampusConnect utilizes automated, serverless backups via Google Cloud Storage and Firebase Cloud Functions.

- **Trigger:** Cloud Pub/Sub Cron (`0 2 * * 0` - Every Sunday at 02:00 AM UTC).
- **Target Location:** `gs://campusconnect-college-db-backups/firestore-backups/{timestamp}`.
- **Scope:** Complete export of all collections including document schemas, subcollections, and indexes.

### Manual gcloud CLI Backup Command
Administrators can trigger an ad-hoc cloud snapshot at any time:
```bash
gcloud firestore export gs://campusconnect-college-db-backups/firestore-backups/adhoc-$(date +%Y%m%d%H%M%S) \
    --project=campusconnect-college-db
```

---

## 2. Local JSON & CSV Backup Export Utility

The project provides a standalone backup tool:
```bash
npm run export-data
```

This exports all active collections into timestamped folders under `backups/backup_{timestamp}/`:
- `{collectionName}.json`: Complete hierarchical data structures.
- `{collectionName}.csv`: Flattened tabular rows for reporting and spreadsheet compatibility.
- `backup_metadata.json`: Timestamp, record counts, and integrity checksums.

---

## 3. Disaster Recovery & Restoration Procedures

### Restoring from Google Cloud Storage
In the event of accidental data loss or corruption:

```bash
# Restore specific collections
gcloud firestore import gs://campusconnect-college-db-backups/firestore-backups/{TIMESTAMP} \
    --collection-ids=students,attendance,academic_records \
    --project=campusconnect-college-db

# Or restore the entire database
gcloud firestore import gs://campusconnect-college-db-backups/firestore-backups/{TIMESTAMP} \
    --project=campusconnect-college-db
```

### Restoring from Local JSON Backups
To re-seed or restore from exported JSON archives:
```bash
npm run import-data ./backups/backup_1732095000000/students.json
```

---

## 4. Backup Verification & Health Auditing

1. **Record Count Auditing:** Verify that exported collection counts match production `summary` statistics.
2. **Deterministic Hash Check:** Verify JSON structures against `backup_metadata.json`.
3. **Automated Audit Entry:** Every backup creation is logged to the `audit_logs` collection with `actionType: 'DATA_EXPORT'`.
