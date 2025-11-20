#!/usr/bin/env python3
"""
Inspecciona `sag_d1.sqlite`: muestra columnas de tablas y conteos.
Uso: desde la raíz del repo:
  python scripts/sqlite_inspect.py
"""
import sqlite3
tables = ['Users','Courses','CourseBlocks','Enrollments','QuizResults']
db = 'sag_d1.sqlite'
try:
    c = sqlite3.connect(db)
except Exception as e:
    print('Error abriendo DB', db, e)
    raise

for t in tables:
    try:
        cols = [row[1] for row in c.execute(f"PRAGMA table_info('{t}')")]
        count = c.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0]
    except Exception as e:
        cols = f'error: {e}'
        count = f'error: {e}'
    print('---')
    print(f'Table: {t}')
    print('Columns:', cols)
    print('Count:  ', count)

c.close()
