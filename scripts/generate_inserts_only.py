#!/usr/bin/env python3
"""
Genera un archivo SQL que contiene únicamente las sentencias INSERT extraídas
de la base sqlite `sag_d1.sqlite`.

Uso:
  python scripts/generate_inserts_only.py --db sag_d1.sqlite --out inserts_only.sql

Este archivo es adecuado para ejecutar en D1 después de haber aplicado el esquema
(`d1_schema.sql`). Evita CREATE TABLE/PRAGMA/BEGIN/COMMIT que pueden causar errores.
"""
import argparse
import sqlite3

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--db', default='sag_d1.sqlite')
    parser.add_argument('--out', default='inserts_only.sql')
    args = parser.parse_args()

    con = sqlite3.connect(args.db)
    with open(args.out, 'w', encoding='utf8') as f:
        for line in con.iterdump():
            # Keep only INSERT statements
            if line.strip().upper().startswith('INSERT INTO'):
                f.write(line + '\n')
    con.close()
    print('Wrote inserts to', args.out)

if __name__ == '__main__':
    main()
