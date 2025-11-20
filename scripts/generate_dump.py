#!/usr/bin/env python3
"""
Genera `data_dump.sql` a partir de `sag_d1.sqlite` usando sqlite3.iterdump().
Uso:
  python scripts/generate_dump.py --db sag_d1.sqlite --out data_dump.sql

El archivo resultante contiene sentencias SQL (CREATE/INSERT) que pueden ejecutarse
en el editor SQL de Cloudflare D1 o mediante `wrangler d1 execute`.
"""
import sqlite3
import argparse

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--db', default='sag_d1.sqlite')
    parser.add_argument('--out', default='data_dump.sql')
    args = parser.parse_args()

    con = sqlite3.connect(args.db)
    with open(args.out, 'w', encoding='utf8') as f:
        for line in con.iterdump():
            f.write(f"{line}\n")
    con.close()
    print('Generated', args.out)

if __name__ == '__main__':
    main()
