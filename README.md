# Centro Educativo SAG

README de entrega — Proyecto Centro Educativo SAG

Última actualización: 19 de noviembre de 2025

---

## Resumen

Aplicación web para gestión de cursos, estudiantes y quizzes. Soporta roles (`teacher`, `student`, `admin`) y permite a los docentes ver, crear, editar, asignar y eliminar cursos. El sistema usa Clerk para autenticación y PostgreSQL (Sequelize) en el backend.

Este repositorio contiene la parte `backend` (API REST con Express + Sequelize) y la parte `frontend` (aplicación React/Vite usando Clerk para autenticación y consumo de la API).

---

## Estructura del repositorio

- `backend/` — servidor Express, modelos Sequelize, controladores y rutas.
  - `src/` — código fuente del backend
    - `config/database.js` — configuración de Sequelize (usa `DATABASE_URL`)
    - `controllers/courseController.js` — lógica de cursos, asignaciones y resultados
    - `models/` — modelos Sequelize: `UserModel.js`, `CourseModel.js`, `EnrollmentModel.js`, `QuizResultModel.js`, etc.
    - `routes/` — rutas (incluye `courses.js`, `userRoutes.js`, `clerkWebhook.js`)
    - `server.js` — punto de entrada, sincroniza DB, define `/sync-user` y monta rutas
  - `sync.js` — script útil para sincronizar tablas (ejecuta `sequelize.sync({ alter: true })`)

- `frontend/` — aplicación React (Vite)
  - `src/` — componentes, rutas, `api.js` (cliente HTTP), utilidades
  - `components/` — `Dashboard`, `CourseEditor`, `CourseView`, `Register`, etc.

---

## Requisitos

- Node.js 18+ (o versión usada en el entorno)
- npm
- PostgreSQL
- Cuenta y configuración de Clerk (auth)

---

## Variables de entorno

Backend (ejecutar en `backend/`):

- `DATABASE_URL` — URL de conexión a PostgreSQL (ej. `postgres://user:pass@host:port/dbname`).
- `CLERK_API_KEY` / `CLERK_JWT_KEY` u otras variables requeridas por Clerk (según configuración). El proyecto usa `@clerk/clerk-sdk-node` y `ClerkExpressRequireAuth()` en `server.js`. Configurar las variables que Clerk solicita en el entorno (según tu cuenta).
- `PORT` — puerto del servidor (opcional, por defecto 4000).

Frontend (ejecutar en `frontend/`):

- `VITE_API_BASE` — URL base del backend (ej. `http://localhost:4000` o la URL pública de despliegue).
- Otras variables de Clerk en el frontend según la configuración de Clerk (Client ID, publishable key) en el archivo `.env` del frontend si aplica.

---

## Instalación y ejecución local

1. Preparar Backend

```powershell
cd backend
npm install
# crear .env con DATABASE_URL, CLERK keys, PORT (opcional)
# sincronizar tablas (opcional):
node sync.js
# iniciar servidor en modo desarrollo (según package.json):
npm run dev
# o
npm start
```

2. Preparar Frontend

```powershell
cd frontend
npm install
# crear .env con VITE_API_BASE y claves de Clerk si aplica
npm run dev
```

Accede a la app frontend (p. ej. `http://localhost:5173`) y prueba las rutas y funciones.

---

## Endpoints principales (documentación rápida)

- POST `/sync-user` — (Clerk) sincroniza usuario autenticado con la tabla `Users` del backend. Requiere autenticación Clerk.

- Cursos
  - `POST /courses` — Crear curso
  - `GET /courses/my-courses` — Obtener cursos (los `teacher` ven todos los cursos)
  - `GET /courses/:courseId` — Obtener curso por id
  - `PUT /courses/:courseId` — Actualizar curso (requiere `teacher`)
  - `DELETE /courses/:courseId` — Eliminar curso (requiere `teacher`)
  - `GET /courses/:courseId/blocks` — Obtener bloques (texto, video, imagen, quiz)
  - `PUT /courses/:courseId/blocks` — Guardar bloques (requiere `teacher`)

- Asignaciones & quizzes
  - `POST /courses/:courseId/assign` — Asignar estudiante(s) al curso (crea `Enrollment`)
  - `POST /courses/:courseId/blocks/:quizBlockId/assign` — Asignar quiz a estudiante(s) (crea `QuizResult` y `Enrollment` si no existía)
  - `POST /courses/:courseId/quiz/submit` — Enviar resultado de quiz por estudiante
  - `GET /courses/:courseId/quiz/results` — Obtener resultados del curso; acepta query `?clerkId=...` para filtrar por estudiante
  - `GET /courses/:courseId/enrollments` — (nuevo) Obtener enrollments válidos con datos de usuario

- Usuarios
  - `GET /api/users?role=student` — Obtener todos los estudiantes (usado por frontend para asignaciones)
  - `PUT /api/users/:clerkId/role` — Actualizar rol (teacher/student) (protegido/administrativo)

---

## Notas funcionales y decisiones importantes

1. Permisos de profesor
   - Se cambió la lógica para que los `teacher` puedan editar, borrar y asignar cursos independientemente de si fueron los creadores. Las rutas relevantes verifican ahora `User.role === 'teacher'`.

2. Estadísticas del Dashboard
   - El recuento principal "Estudiantes Inscritos" ahora toma como fuente de verdad `students.length` (lista de estudiantes devuelta por el backend). Además, por curso se combinan `QuizResults` y `Enrollments` para contar inscritos por curso.
   - Se agregó `GET /courses/:courseId/enrollments` para obtener enrollments válidos.
   - Se implementó un evento global `userSynced` (frontend) que se despacha al sincronizar un usuario y que hace que el Dashboard recargue automáticamente.

3. Datos huérfanos
   - Hubo casos donde usuarios se borraban directamente (Clerk/PG) dejando filas huérfanas en `Enrollments` y `QuizResults`. Para evitar mostrar usuarios inexistentes, las APIs ahora filtran y devuelven sólo datos relacionados con `Users` existentes.
   - Se incluye SQL de limpieza opcional en este README.

---

## SQL de limpieza (opcional/administrativo)

Ejecutar antes de borrar o como mantenimiento (hacer backup antes):

```sql
-- Eliminar enrollments sin usuario
DELETE FROM "Enrollments" e
WHERE e."clerkId" NOT IN (SELECT u."clerkId" FROM "Users" u);

-- Eliminar quiz results sin usuario
DELETE FROM "QuizResults" q
WHERE q."clerkId" NOT IN (SELECT u."clerkId" FROM "Users" u);
```

---

## Despliegue

- El backend está preparado para entornos como Render o Heroku; `config/database.js` usa `process.env.DATABASE_URL` con `ssl` configurado para Render.
- Asegurarse de configurar variables de entorno de Clerk en producción (publicable key en frontend, secret key en backend) y la URL del backend en `VITE_API_BASE`.

---

## Pruebas y verificación

Casos de prueba manuales recomendados:
- Registrar un estudiante desde Clerk y verificar que `POST /sync-user` crea el usuario en la BD.
- Iniciar sesión como profesor en otra sesión y verificar que la tarjeta "Estudiantes Inscritos" se actualiza automáticamente.
- Asignar estudiantes a un curso y verificar que `Enrollments` se crean y el Dashboard los muestra.
- Borrar un usuario desde Clerk/pgAdmin y verificar que las APIs no devuelven datos para ese usuario (y que la UI ya no lo muestra).

---

## Seguridad y mejoras sugeridas

- Implementar FK y `ON DELETE CASCADE` entre `Users` y `Enrollments` / `QuizResults` si el modelo de negocio lo permite. Esto evita huérfanos en la DB.
- Implementar SSE o WebSockets para actualizaciones en tiempo real desde el backend (más robusto que el evento global en frontend).
- Añadir pruebas automatizadas (unitarias e integración) para los endpoints nuevos y la lógica de permisos/filtrado.
- Añadir autenticación/roles más finos para endpoints administrativos (por ejemplo, limpieza de huérfanos).

---

## Archivos y cambios destacados (lista técnica)

- `backend/src/controllers/courseController.js`
  - Modificaciones: `updateCourse`, `deleteCourse`, `assignStudent`, `assignQuiz`, `saveCourseBlocks`, `getMyCourses`, `getQuizResults` (filtrado) y nuevo `getCourseEnrollments`.
- `backend/src/routes/courses.js`
  - Nueva ruta: `/:courseId/enrollments`.
- `frontend/src/api.js` — nueva función `getEnrollments`.
- `frontend/src/components/Dashboard.jsx` — refactor `loadDashboardData`, escucha `userSynced`, usa `students.length` para tarjeta principal.
- `frontend/src/components/CourseEditor.jsx`, `CourseView.jsx` — visibilidad de controles para todos los teachers.
- `frontend/src/App.jsx` — emite evento `userSynced` tras `syncUser`.

---

## ¿Qué entrego?

- Este README con instrucciones.
- Cambios aplicados ya en el repositorio en la rama `main`.
- SQL de limpieza propuesto.
- Recomendaciones de mejoras y pruebas para producción.

---

## Contacto / Soporte

Si necesitas que prepare:
- Un `README.pdf` con este contenido (lo genero y subo al repo),
- Un endpoint administrativo para limpieza de huérfanos,
- Implementar WebSockets o pruebas automatizadas,

puedo encargármelo — indícame qué prefieres y lo implemento.

---

Gracias. Si quieres que genere también un `CHANGELOG.md` o un PDF del README, dímelo y lo creo.
