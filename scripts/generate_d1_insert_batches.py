#!/usr/bin/env python3
"""
Genera archivos SQL por lotes a partir de un archivo SQLite local.

Uso:
  python scripts/generate_d1_insert_batches.py --db sag_d1.sqlite --outdir scripts/out --batch-size 500

El script lee todas las tablas presentes en la BD y crea
`inserts_part_*.sql` conteniendo INSERTs con cadenas
correctamente escapadas ('' para comillas simples) y
`INSERT OR IGNORE` para evitar errores por duplicados si la tabla
ya contiene filas.
"""
import argparse
import os
import sqlite3
import math
import textwrap


def sql_escape(value):
    if value is None:
        return 'NULL'
    if isinstance(value, (int, float)):
        return str(value)
    # Otherwise treat as text; ensure it's a Python str
    s = str(value)
    # Remove embedded NULs which can break some SQL processors
    s = s.replace('\x00', '')
    # Normalize whitespace and escape newlines so each INSERT is safer to pass via file/CLI
    s = s.replace('\r', '')
    s = s.replace('\n', '\\n')
    # Collapse multiple spaces introduced by newlines into single spaces where appropriate
    # (keep this simple to avoid changing intended content structure)
    s = ' '.join(s.split())
    # Escape single quotes for SQL literal
    s = s.replace("'", "''")
    return "'{}'".format(s)


def generate_inserts_for_table(conn, table):
    cur = conn.cursor()
    # Get columns in order
    cur.execute(f"PRAGMA table_info('{table}')")
    cols_info = cur.fetchall()
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
    parser.add_argument('--outdir', default='scripts/out', help='Directorio de salida para partes SQL')
    parser.add_argument('--batch-size', type=int, default=500, help='Cantidad máxima de INSERTs por archivo')
    parser.add_argument('--tables', nargs='*', help='Lista opcional de tablas en el orden deseado')
    parser.add_argument('--no-transactions', action='store_true', help='No incluir PRAGMA/BEGIN/COMMIT en los archivos (útil para D1)')
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

    all_inserts = []
    for t in tables:
        print(f'Leyendo tabla: {t}')
        inserts = generate_inserts_for_table(conn, t)
        print(f'  -> {len(inserts)} INSERTs generados')
        all_inserts.extend(inserts)

    if not all_inserts:
        print('No se generaron INSERTs (BD vacía).')
        return

    total = len(all_inserts)
    batches = math.ceil(total / args.batch_size)
    print(f'Escribiendo {total} INSERTs en {batches} archivo(s) (batch-size={args.batch_size})')

    for i in range(batches):
        start = i * args.batch_size
        end = min(start + args.batch_size, total)
        part = all_inserts[start:end]
        fname = os.path.join(args.outdir, f'inserts_part_{i+1:03d}.sql')
        with open(fname, 'w', encoding='utf-8') as f:
            header_lines = [f'-- inserts_part_{i+1:03d}.sql', f'-- Contiene INSERTs {start+1}..{end} de {total}']
            if not args.no_transactions:
                header_lines.append('PRAGMA foreign_keys = OFF;')
                header_lines.append('BEGIN TRANSACTION;')
            f.write('\n'.join(header_lines) + '\n')
            for stmt in part:
                f.write(stmt + '\n')
            if not args.no_transactions:
                f.write('COMMIT;\n')
        print(f'  -> escrito {fname} ({len(part)} inserts)')

    conn.close()


if __name__ == '__main__':
    main()
