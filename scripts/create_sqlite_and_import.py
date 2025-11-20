#!/usr/bin/env python3
r"""
Crear una base SQLite desde `d1_schema.sql` y importar todos los CSV/CSX de una carpeta.

Uso:
    python scripts/create_sqlite_and_import.py --db sag_d1.sqlite --schema d1_schema.sql --csv-dir "C:/Users/jctib/Downloads/db"

El script no requiere sqlite3.exe; usa la librería estándar `sqlite3` de Python.
Hace match de columnas de forma case-insensitive y mapea nombres comunes (p.ej. clerkid -> clerkId).
"""
import sqlite3
import csv
import argparse
import os
import sys
from glob import glob


COMMON_HEADER_MAP = {
    'clerkid': 'clerkId',
    'firstname': 'firstName',
    'lastname': 'lastName',
    'createdat': 'createdAt',
    'updatedat': 'updatedAt'
}


def normalize_header(h):
    key = h.strip()
    low = key.lower()
    if low in COMMON_HEADER_MAP:
        return COMMON_HEADER_MAP[low]
    return key


def get_table_columns(conn, table):
    cur = conn.execute(f"PRAGMA table_info([{table}])")
    cols = [row[1] for row in cur.fetchall()]
    return cols


def insert_csv(conn, table, csv_path):
    if not os.path.exists(csv_path):
        print(f"CSV not found: {csv_path}")
        return 0
    # Read header
    with open(csv_path, newline='', encoding='utf8') as f:
        reader = csv.reader(f)
        try:
            header = next(reader)
        except StopIteration:
            print(f"Empty CSV: {csv_path}")
            return 0

    header_norm = [normalize_header(h) for h in header]

    # Map headers to actual table columns (case-insensitive)
    table_cols = get_table_columns(conn, table)
    table_cols_lower = {c.lower(): c for c in table_cols}

    mapped_cols = []
    for h in header_norm:
        low = h.lower()
        if low in table_cols_lower:
            mapped_cols.append(table_cols_lower[low])
        else:
            # skip unknown columns
            mapped_cols.append(None)

    insert_cols = [c for c in mapped_cols if c is not None]
    if not insert_cols:
        print(f"No matching columns for {csv_path} in table {table}")
        return 0

    placeholders = ','.join('?' for _ in insert_cols)
    col_list = ','.join(f'[{c}]' for c in insert_cols)
    sql = f'INSERT INTO [{table}] ({col_list}) VALUES ({placeholders})'

    count = 0
    with open(csv_path, newline='', encoding='utf8') as f:
        reader = csv.DictReader(f)
        rows = []
        for r in reader:
            vals = []
            for h in header_norm:
                low = h.lower()
                mapped = None
                if low in table_cols_lower:
                    mapped = table_cols_lower[low]
                # Only include if mapped
                if mapped:
                    val = r.get(h) if h in r else r.get(h.strip())
                    vals.append(val)
            if vals:
                rows.append(vals)
        if rows:
            conn.executemany(sql, rows)
            conn.commit()
            count = len(rows)
    print(f"Inserted {count} rows into {table} from {csv_path}")
    return count


def find_csv_files(csv_dir):
    patterns = ['*.csv', '*.csx']
    files = []
    for p in patterns:
        files.extend(glob(os.path.join(csv_dir, p)))
    return files


def table_from_filename(path):
    base = os.path.basename(path)
    name, _ = os.path.splitext(base)
    # Normalize common names: Users.csv -> Users, CourseBlocks.csv -> CourseBlocks
    return name


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--db', required=True, help='SQLite DB path to create/use')
    parser.add_argument('--schema', required=True, help='Path to d1_schema.sql')
    parser.add_argument('--csv-dir', required=True, help='Directory containing CSVs')
    args = parser.parse_args()

    if not os.path.exists(args.schema):
        print('Schema file not found:', args.schema)
        sys.exit(1)

    conn = sqlite3.connect(args.db)
    with open(args.schema, 'r', encoding='utf8') as f:
        sql = f.read()
    conn.executescript(sql)
    print(f"Created/updated DB {args.db} using schema {args.schema}")

    files = find_csv_files(args.csv_dir)
    if not files:
        print('No CSV files found in', args.csv_dir)
        sys.exit(0)

    total = 0
    for fp in files:
        table = table_from_filename(fp)
        print('Importing', fp, '-> table', table)
        total += insert_csv(conn, table, fp)

    print(f'Total rows inserted: {total}')
    conn.close()


if __name__ == '__main__':
    main()
