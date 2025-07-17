#!/bin/bash

DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="hydrodip_inventory"
DB_USER="postgres"
BACKUP_DIR="./db_backups"
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_backup.dump"

mkdir -p "$BACKUP_DIR"

echo "🔄 Starting backup for database: $DB_NAME ..."

PGPASSWORD="your_password_here" pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -F c \
  -d "$DB_NAME" \
  -f "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "✅ Backup completed successfully: $BACKUP_FILE"
else
  echo "❌ Backup failed!"
  exit 1
fi
