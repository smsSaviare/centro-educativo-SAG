#!/usr/bin/env python3
"""
Extrae courseId únicos de `QuizResults_inserts.sql` y genera
`missing_courses.sql` con INSERT OR IGNORE para crear marcadores.

Uso:
  python scripts/generate_missing_course_placeholders.py --quiz-sql .\scripts\out_tables\QuizResults_inserts.sql --out scripts/missing_courses.sql
"""
import argparse
import re
import os


def extract_course_ids(quiz_sql_path):
    txt = open(quiz_sql_path, 'r', encoding='utf-8').read()
    # busca el segundo número en VALUES (...) que es courseId
    pattern = re.compile(r'VALUES\s*\(\s*\d+\s*,\s*(\d+)', re.IGNORECASE)
    ids = pattern.findall(txt)
    return sorted({int(i) for i in ids})


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--quiz-sql', required=True, help='Ruta al SQL de QuizResults (generado)')
    parser.add_argument('--out', default='scripts/missing_courses.sql', help='Archivo SQL de salida')
    args = parser.parse_args()

    if not os.path.exists(args.quiz_sql):
        raise SystemExit(f"No se encontró {args.quiz_sql}")

    ids = extract_course_ids(args.quiz_sql)
    if not ids:
        print('No se encontraron courseId en el archivo proporcionado.')
        return

    lines = ["-- missing_courses.sql - placeholders for missing course IDs\n"]
    for cid in ids:
        title = f"Imported placeholder course {cid}"
        # Insert with explicit id; use INSERT OR IGNORE to avoid duplicates
        lines.append(
            f"INSERT OR IGNORE INTO Courses (id, title, description, createdAt, updatedAt) VALUES ({cid}, '{title.replace("'","''")}', '', datetime('now'), datetime('now'));"
        )

    with open(args.out, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')

    print(f'Escrito {args.out} con {len(ids)} posibles courseId')


if __name__ == '__main__':
    main()
