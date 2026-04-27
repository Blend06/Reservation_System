# Database Backup & Restore Scripts

## Quick Reference

### Export Current Database
```bash
docker compose exec backend python manage.py shell -c "exec(open('scripts/db/export_backup.py').read())"
```

### Seed Initial Data (Fresh Install)
```bash
docker compose exec backend python manage.py shell -c "exec(open('scripts/db/seed_initial_data.py').read())"
```

### Import SQL Backup
```bash
# Copy backup file to container first
docker cp scripts/db/backup/backup_20240101_120000.sql fade_district-db-1:/tmp/

# Import
docker compose exec db psql -U postgres -d fade_district -f /tmp/backup_20240101_120000.sql
```

---

## Directory Structure

```
scripts/db/
├── README.md              # This file
├── export_backup.py       # Export script
├── seed_initial_data.py   # Seed script
└── backup/                # SQL backup files only
    └── backup_YYYYMMDD_HHMMSS.sql
```

---

## Scripts

### `export_backup.py`
Exports all data to a timestamped SQL file in `backup/` folder.

**What it exports:**
- Businesses
- Users (with hashed passwords)
- Staff members
- Reservations

**Usage:**
```bash
docker compose exec backend python manage.py shell -c "exec(open('scripts/db/export_backup.py').read())"
```

---

### `seed_initial_data.py`
Creates essential accounts for a fresh database.

**What it creates:**
| Account | Email | Password |
|---------|-------|----------|
| Super Admin | admin@fadedistrict.com | Admin123! |
| Test Business Owner | testadmin@example.com | Test123! |
| Test Business | testadmin (subdomain) | - |

**Usage:**
```bash
docker compose exec backend python manage.py shell -c "exec(open('scripts/db/seed_initial_data.py').read())"
```

---

## Full Recovery Process

If database is completely lost:

1. **Ensure containers are running:**
   ```bash
   docker compose up -d
   ```

2. **Run Django migrations:**
   ```bash
   docker compose exec backend python manage.py migrate
   ```

3. **Option A: Restore from backup SQL**
   ```bash
   docker cp scripts/db/backup/backup_XXXXXX.sql fade_district-db-1:/tmp/
   docker compose exec db psql -U postgres -d fade_district -f /tmp/backup_XXXXXX.sql
   ```

4. **Option B: Seed fresh data**
   ```bash
   docker compose exec backend python manage.py shell -c "exec(open('scripts/db/seed_initial_data.py').read())"
   ```

---

## Scheduled Backups (Optional)

Add to crontab for daily backups:
```bash
0 2 * * * cd /path/to/project && docker compose exec -T backend python manage.py shell -c "exec(open('scripts/db/export_backup.py').read())"
```
