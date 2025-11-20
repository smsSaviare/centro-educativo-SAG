#!/usr/bin/env python3
"""
Simple importer: toma archivos CSV con encabezado y los inserta en la tabla SQLite correspondiente.
Uso: python scripts/import_csv_to_sqlite.py --db sag_d1.sqlite --table Users --csv path/to/Users.csv

Requiere: Python 3 (viene en Windows 10+ opcionalmente), no requiere dependencias externas.
"""
import csv
import sqlite3
import argparse
import os

def import_csv(db_path, table, csv_path):
    if not os.path.exists(csv_path):
        raise SystemExit(f"CSV file not found: {csv_path}")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    with open(csv_path, newline='', encoding='utf8') as f:
        reader = csv.DictReader(f)
        cols = reader.fieldnames
        placeholders = ','.join('?' for _ in cols)
        col_list = ','.join(cols)
        sql = f'INSERT INTO {table} ({col_list}) VALUES ({placeholders})'
        rows = []
        for r in reader:
            # normalize keys: keep CSV header names as-is (assumes they match table columns)
            vals = [r.get(c) for c in cols]
            rows.append(vals)
        if rows:
            cur.executemany(sql, rows)
            conn.commit()
            print(f"Inserted {len(rows)} rows into {table} from {csv_path}")
        else:
            print(f"No rows found in {csv_path}")

    conn.close()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--db', required=True, help='sqlite db path (e.g. sag_d1.sqlite)')
    parser.add_argument('--table', required=True, help='table name in sqlite')
    parser.add_argument('--csv', required=True, help='path to csv file')
    args = parser.parse_args()
    import_csv(args.db, args.table, args.csv)

if __name__ == '__main__':
    main()
