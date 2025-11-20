#!/usr/bin/env python3
r"""
Importador para CSVs sin encabezado exportados desde pgAdmin.
Mapea columnas por posición según el nombre del archivo.

Uso:
    python scripts/import_headerless_csvs.py --db sag_d1.sqlite --csv-dir "C:/Users/jctib/Downloads/db"

Este script no sobrescribe tablas existentes; inserta filas nuevas.
"""
import argparse
import csv
import os
import sqlite3
from glob import glob

# Mapas de columnas por tabla (orden esperado en los CSV exportados)
TABLE_COLUMN_ORDERS = {
    'Users': ['id','clerkId','email','firstName','lastName','role','createdAt','updatedAt'],
    'Courses': ['id','title','description','image','resources','creatorClerkId','createdAt','updatedAt'],
    'CourseBlocks': ['id','courseId','type','content','position'],
    'Enrollments': ['id','courseId','clerkId','assignedAt'],
    'QuizResults': ['id','courseId','clerkId','quizBlockId','score','answers','assignedBy','completedAt','attempts','maxAttempts']
}

def find_files(csv_dir):
    patterns = ['*.csv','*.csx']
    files = []
    for p in patterns:
        files.extend(glob(os.path.join(csv_dir,p)))
    return files

def table_name_from_file(path):
    base = os.path.basename(path)
    name, _ = os.path.splitext(base)
    return name

def import_file(conn, path, table):
    if table not in TABLE_COLUMN_ORDERS:
        print(f'Skipping {path}: no column mapping for table {table}')
        return 0
    cols = TABLE_COLUMN_ORDERS[table]
    placeholders = ','.join('?' for _ in cols)
    col_list = ','.join(f'[{c}]' for c in cols)
    sql = f'INSERT INTO [{table}] ({col_list}) VALUES ({placeholders})'
    count = 0
    with open(path, newline='', encoding='utf8') as f:
        reader = csv.reader(f)
        for row in reader:
            # skip empty lines
            if not row or all(not cell.strip() for cell in row):
                continue
            # Trim or extend row to match cols length
            if len(row) < len(cols):
                row = row + [None] * (len(cols)-len(row))
            elif len(row) > len(cols):
                row = row[:len(cols)]
            # Convert empty strings to None
            row = [None if (isinstance(cell, str) and cell.strip()=='') else cell for cell in row]

            # Table-specific defaults / fixes
            if table == 'QuizResults':
                # Ensure attempts and maxAttempts have defaults if missing
                # QuizResults cols: ['id','courseId','clerkId','quizBlockId','score','answers','assignedBy','completedAt','attempts','maxAttempts']
                try:
                    # attempts index 8, maxAttempts index 9
                    if row[8] is None or row[8] == '':
                        row[8] = 0
                    if row[9] is None or row[9] == '':
                        row[9] = 1
                except IndexError:
                    # pad if needed
                    while len(row) < 10:
                        row.append(None)
                    row[8] = row[8] or 0
                    row[9] = row[9] or 1

            try:
                conn.execute(sql, row)
                count += 1
            except Exception as e:
                print(f'Error inserting row into {table} from {path}:', e)
                # continue with next row
                continue
    conn.commit()
    print(f'Inserted {count} rows into {table} from {path}')
    return count

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--db', required=True)
    parser.add_argument('--csv-dir', required=True)
    args = parser.parse_args()

    files = find_files(args.csv_dir)
    if not files:
        print('No CSV files found in', args.csv_dir)
        return

    conn = sqlite3.connect(args.db)
    total = 0
    for fp in files:
        table = table_name_from_file(fp)
        print('Processing', fp, '->', table)
        total += import_file(conn, fp, table)

    conn.close()
    print('Total rows imported:', total)

if __name__ == '__main__':
    main()
