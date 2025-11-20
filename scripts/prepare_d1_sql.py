#!/usr/bin/env python3
"""
Prepara un SQL dump para Cloudflare D1:
- elimina sentencias no soportadas (BEGIN TRANSACTION / COMMIT / PRAGMA, sqlite_sequence, etc.)
- opcional: divide el archivo en partes con un número máximo de statements por archivo

Uso:
  python scripts/prepare_d1_sql.py --in data_dump.sql --out data_dump_clean.sql --split 200

Luego ejecutar con wrangler por partes:
  wrangler d1 execute sag_db --file part_001.sql --remote
  ...
"""
import argparse
import re
import os
from pathlib import Path

SKIP_PREFIXES = [
    'BEGIN TRANSACTION',
    'COMMIT',
    'PRAGMA ',
    'SAVEPOINT ',
    'RELEASE ',
]

SKIP_PATTERNS = [
    re.compile(r"^CREATE TABLE sqlite_"),
    re.compile(r"^INSERT INTO \"sqlite_"),
]

def should_skip(line):
    s = line.strip()
    if not s:
        return True
    for p in SKIP_PREFIXES:
        if s.upper().startswith(p):
            return True
    for pat in SKIP_PATTERNS:
        if pat.match(s):
            return True
    return False


def split_statements(sql_text):
    # Very simple splitter: split on semicolon at line end. Keep statements ending with ';'
    stmts = []
    cur = []
    for line in sql_text.splitlines():
        cur.append(line)
        if line.strip().endswith(';'):
            stmt = '\n'.join(cur).strip()
            if stmt:
                stmts.append(stmt)
            cur = []
    # any trailing
    if cur:
        stmt = '\n'.join(cur).strip()
        if stmt:
            stmts.append(stmt)
    return stmts


def clean_sql_file(input_path, out_path, split=None):
    with open(input_path, 'r', encoding='utf8') as f:
        text = f.read()

    # remove Windows style \r
    text = text.replace('\r\n', '\n')

    # Remove PRAGMA foreign_keys lines that might be at top
    lines = text.splitlines()
    cleaned_lines = []
    for line in lines:
        if should_skip(line):
            continue
        cleaned_lines.append(line)

    cleaned_text = '\n'.join(cleaned_lines)

    # Split statements
    stmts = split_statements(cleaned_text)

    if not split:
        with open(out_path, 'w', encoding='utf8') as f:
            for s in stmts:
                f.write(s.rstrip() + '\n')
        print('Wrote', out_path, 'with', len(stmts), 'statements')
        return [out_path]

    # write parts
    out_dir = Path(out_path).parent
    base = Path(out_path).stem
    part_files = []
    for i in range(0, len(stmts), split):
        chunk = stmts[i:i+split]
        idx = i // split + 1
        fname = out_dir / f"{base}_part_{idx:03d}.sql"
        with open(fname, 'w', encoding='utf8') as f:
            for s in chunk:
                f.write(s.rstrip() + '\n')
        part_files.append(str(fname))
    print('Wrote', len(part_files), 'part files, total statements', len(stmts))
    return part_files


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--in', dest='input', required=True)
    parser.add_argument('--out', required=True)
    parser.add_argument('--split', type=int, default=0, help='Statements per output file (0 = single file)')
    args = parser.parse_args()

    parts = clean_sql_file(args.input, args.out, split=args.split or None)
    for p in parts:
        print('->', p)

if __name__ == '__main__':
    main()
