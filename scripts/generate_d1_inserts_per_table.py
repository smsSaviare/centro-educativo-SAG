#!/usr/bin/env python3
"""
Genera un archivo SQL por tabla con INSERTs escapados para D1.

Uso:
  python scripts/generate_d1_inserts_per_table.py --db sag_d1.sqlite --outdir scripts/out_tables --tables Users Courses CourseBlocks Enrollments QuizResults

Cada archivo generado es `<outdir>/<table>_inserts.sql` y contiene únicamente
una línea por INSERT (sin PRAGMA/BEGIN/COMMIT por defecto). Esto facilita
ejecutar cada tabla por separado en D1 para aislar errores de FK.
"""
import argparse
import os
import sqlite3
import textwrap


def sql_escape(value):
    if value is None:
        return 'NULL'
    if isinstance(value, (int, float)):
        return str(value)
    s = str(value)
    s = s.replace('\x00', '')
    s = s.replace('\r', '')
    s = s.replace('\n', '\\n')
    s = ' '.join(s.split())
    s = s.replace("'", "''")
    return "'{}'".format(s)


def generate_inserts_for_table(conn, table):
    cur = conn.cursor()
    cur.execute(f"PRAGMA table_info('{table}')")
    cols_info = cur.fetchall()
    if not cols_info:
        return []
    cols = [c[1] for c in cols_info]
    col_list_sql = ', '.join([f'"{c}"' for c in cols])

    cur.execute(f"SELECT {', '.join(cols)} FROM '{table}'")
    rows = cur.fetchall()
    inserts = []
    for row in rows:
        vals = [sql_escape(v) for v in row]
        vals_sql = ', '.join(vals)
        stmt = f'INSERT OR IGNORE INTO "{table}" ({col_list_sql}) VALUES ({vals_sql});'
        inserts.append(stmt)
    return inserts


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--db', required=True, help='Ruta al archivo sqlite (ej. sag_d1.sqlite)')
    parser.add_argument('--outdir', default='scripts/out_tables', help='Directorio de salida para archivos por tabla')
    parser.add_argument('--tables', nargs='*', help='Lista de tablas en el orden deseado')
    args = parser.parse_args()

    if not os.path.exists(args.db):
        raise SystemExit(f"No se encontró la BD en '{args.db}'. Genera primero 'sag_d1.sqlite'.")

    os.makedirs(args.outdir, exist_ok=True)
    conn = sqlite3.connect(args.db)
    cur = conn.cursor()

    if args.tables:
        tables = args.tables
    else:
        cur.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
        tables = [r[0] for r in cur.fetchall()]

    for t in tables:
        print(f'Generando INSERTs para tabla: {t}')
        inserts = generate_inserts_for_table(conn, t)
        fname = os.path.join(args.outdir, f'{t}_inserts.sql')
        with open(fname, 'w', encoding='utf-8') as f:
            f.write(f'-- {t}_inserts.sql — {len(inserts)} inserts\n')
            for stmt in inserts:
                f.write(stmt + '\n')
        print(f'  -> escrito {fname} ({len(inserts)} inserts)')

    conn.close()


if __name__ == '__main__':
    main()
