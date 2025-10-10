#!/bin/bash
set -euo pipefail

DB_FILE="tmp/homework-1.db"
USER="root"
PASS="yourpassword"

DATASET_FILE="tmp/dataset.sql"

function create-working-dir {
  if [ -d "$1" ]; then
    rm -r "$1"
  fi
  mkdir "$1"
}

echo "[*] Executing Homework 1 for Statistics"

for DIR in output tmp; do
  echo "[*] Creating directory: $DIR/"
  create-working-dir $DIR
done

echo "[*] Creating SQLite3 database"
rm -f "$DB_FILE"
sqlite3 "$DB_FILE" < init.sql

echo "[*] Generating random dataset"
python3 gen-dataset.py > $DATASET_FILE

echo "[*] Populating database"
sqlite3 "$DB_FILE" < $DATASET_FILE

for QUERY_FILE in $(ls queries); do
  echo "[*] Executing query: $(basename -s .sql $QUERY_FILE)"
  sqlite3 -header -csv "$DB_FILE" < queries/$QUERY_FILE > output/$QUERY_FILE.csv
done

echo "[*] Done. Output can be found in the output/ directory"
