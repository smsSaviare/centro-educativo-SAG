# Worker proxy para Cloudflare D1

Este Worker expone endpoints REST mínimos que el backend puede usar para leer/escribir en la DB D1 `sag_db`.

Requisitos
- `wrangler` instalado y autenticado
- Una D1 DB `sag_db` creada y visible en tu cuenta
- `wrangler.toml` configurado con `account_id` y el binding D1 (ya incluido)

Variables y bindings
- D1 binding: `SAG_DB` (definido en `wrangler.toml`)
- Worker secret: `WORKER_SECRET` (configurar con `wrangler secret put WORKER_SECRET`)

Endpoints implementados (esperan el header `x-internal-secret: <WORKER_SECRET>`):
- GET `/courses` — devuelve todos los cursos
- GET `/courses/:id` — devuelve curso por id
- GET `/courseblocks?courseId=...` — bloques de un curso
- GET `/enrollments?clerkId=...` — enrollments por usuario
- POST `/enrollments` — body `{courseId, clerkId}`
- GET `/quiz-results?clerkId=...` — quiz results por usuario
- POST `/quiz-results` — body con fields del QuizResult
- GET `/users` — devuelve usuarios

Despliegue rápido
1. Edita `wrangler.toml` y configura `account_id`.
2. Crea secret:
   ```powershell
   wrangler secret put WORKER_SECRET
   ```
3. Publica:
   ```powershell
   cd cloudflare_worker
   wrangler publish --env production
   ```

Después del despliegue obtendrás una URL pública del Worker. Actualiza tu backend para llamar a dicha URL con el header `x-internal-secret` para realizar consultas.
