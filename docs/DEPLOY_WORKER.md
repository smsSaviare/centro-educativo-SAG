Deploy del Cloudflare Worker (nota rápida)

Cada vez que modifiques `cloudflare_worker/src/*` debes publicar el Worker actualizado para que los cambios surtan efecto en producción.

Comando (PowerShell):

```powershell
cd C:\Users\jctib\Downloads\Centro_Educativo_Sag\cloudflare_worker
wrangler deploy --env production
```

Notas:
- Asegúrate de que `wrangler` está logueado con la cuenta correcta (`wrangler login`).
- Si actualizaste el secreto (`WORKER_SECRET`), vuelve a ejecutar `wrangler secret put WORKER_SECRET` antes del `deploy`.
- Si ves errores 500 relacionados con D1 (por ejemplo columnas inexistentes), revisa las SQL en `cloudflare_worker/src/index.js` y redeploya.

Si quieres, puedo añadir un script en este repo que imprima este comando o una verificación rápida.
