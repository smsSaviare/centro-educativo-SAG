***
# Centro Educativo SAG

**Repositorio**: API + frontend para gestión de cursos, estudiantes y quizzes.

Última actualización: 19 de noviembre de 2025

Resumen rápido
--------------
App full-stack con:
- Backend: Express + Sequelize + PostgreSQL
- Frontend: React + Vite + Clerk (autenticación)

Objetivo del repo
------------------
Facilitar la gestión de cursos y asignaciones para centros educativos; permitir a docentes crear/editar/asignar/borrar cursos y supervisar resultados.

Lo más importante que se implementó
----------------------------------
- Todos los usuarios con rol `teacher` pueden gestionar cursos (no hace falta ser el creador).
- El Dashboard muestra el total real de estudiantes (fuente: lista de `students`) y se actualiza automáticamente cuando un usuario se sincroniza.
- Se añadió `GET /courses/:id/enrollments` para obtener inscripciones válidas con datos de usuario.
- APIs filtran datos huérfanos (enrollments/results con clerkId sin User existente).

Instalación y ejecución (rápida)
--------------------------------
Backend:
```powershell
cd backend
npm install
# configurar .env con DATABASE_URL y claves de Clerk
node sync.js   # opcional: sincroniza tablas
npm run dev
```

Frontend:
```powershell
cd frontend
npm install
# configurar .env con VITE_API_BASE y claves de Clerk
npm run dev
```

Variables mínimas de entorno
---------------------------
- Backend: `DATABASE_URL`, variables de Clerk (según tu cuenta), `PORT` opcional.
- Frontend: `VITE_API_BASE`.

Endpoints clave
--------------
- `POST /sync-user` — sincroniza usuario Clerk → Users
- Cursos: `POST /courses`, `GET /courses/my-courses`, `GET/PUT/DELETE /courses/:id`
- Asignaciones: `POST /courses/:id/assign` (enrollments)
- Quiz: `POST /courses/:id/blocks/:quizBlockId/assign`, `POST /courses/:id/quiz/submit`, `GET /courses/:id/quiz/results`
- Enrollments: `GET /courses/:id/enrollments` (nuevo)

Cambios técnicos destacados
---------------------------
- Backend: permisos revisados (rol `teacher`), filtrado de datos huérfanos, nuevo controlador `getCourseEnrollments`.
- Frontend: `Dashboard` refactorizado a `loadDashboardData()`, escucha `userSynced`; `CourseEditor` y `CourseView` muestran controles a todos los teachers.
- API cliente: `getEnrollments(courseId)` añadido en `frontend/src/api.js`.

Limpieza de datos huérfanos (opcional)
-------------------------------------
Ejecutar con backup:
```sql
DELETE FROM "Enrollments" e
WHERE e."clerkId" NOT IN (SELECT u."clerkId" FROM "Users" u);

DELETE FROM "QuizResults" q
WHERE q."clerkId" NOT IN (SELECT u."clerkId" FROM "Users" u);
```

Verificación rápida
-------------------
1. Registrar un estudiante en Clerk → el frontend llama `POST /sync-user` y crea/actualiza Users.
2. Abrir Panel Docente en otra sesión → la tarjeta "Estudiantes Inscritos" debe actualizarse automáticamente.
3. Asignar un estudiante a un curso → `Enrollment` creado y visible en Dashboard.

Mejoras recomendadas
---------------------
- Foreign keys con `ON DELETE CASCADE` entre `Users` y tablas dependientes.
- WebSockets/SSE para updates en tiempo real desde backend.
- Endpoint administrativo protegido para limpieza y mantenimiento.

Contacto
-------
Si quieres que genere un `README.pdf`, un `CHANGELOG.md` o implemente la limpieza administrativa / WebSockets, lo implemento.

***
