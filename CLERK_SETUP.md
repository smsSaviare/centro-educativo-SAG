# 🔐 Configuración de Clerk para Producción

## Problema Actual
- Estás usando **claves de desarrollo** en producción
- Clerk tiene límites estrictos para claves de desarrollo
- El JWT template "convex" no existe en tu instancia

## Solución

### 1. Crear Claves de Producción en Clerk

1. Ve a [Dashboard de Clerk](https://dashboard.clerk.com)
2. Selecciona tu aplicación
3. Ve a **Deployments** en la barra lateral izquierda
4. Crea una nueva instancia de **Producción** (Production)
5. Copia las nuevas claves:
   - `VITE_CLERK_PUBLISHABLE_KEY` (pública)
   - `VITE_CLERK_FRONTEND_API` (API frontend)
   - `CLERK_SECRET_KEY` (secreta)

### 2. Configurar Variables en Render

#### Para el Frontend (GitHub Pages o Render):

En tu `.env.production`:
```
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
VITE_CLERK_FRONTEND_API=https://tu-dominio.clerk.accounts.dev
```

#### Para el Backend (Render):

En Render environment variables:
```
CLERK_SECRET_KEY=sk_live_xxxxxxxxxxxxx
CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
```

### 3. Configurar URLs Autorizadas en Clerk

En el Dashboard de Clerk:

**Allowed Origins:**
- `https://smssaviare.github.io`
- `https://sag-backend-b2j6.onrender.com`
- `http://localhost:5173` (desarrollo local)
- `http://localhost:4000` (desarrollo local)

**Allowed Redirect URLs:**
- `https://smssaviare.github.io`
- `https://smssaviare.github.io/#/`
- `http://localhost:5173`
- `http://localhost:5173/#/`

### 4. Webhook Configuration

Si usas webhooks de Clerk:

```
URL: https://sag-backend-b2j6.onrender.com/api/webhooks
Eventos: 
  - user.created
  - user.updated
  - user.deleted
```

### 5. Después de Configurar

1. Actualiza tus archivos `.env` locales
2. Ejecuta en el backend:
   ```bash
   npm install
   git add .
   git commit -m "Update: Usar claves de producción de Clerk"
   git push
   ```
3. Render redesplegará automáticamente

## ⚠️ Notas Importantes

- **Nunca** commits claves secretas a Git
- Usa `.env.local` para desarrollo local
- Configura variables en Render/hosting a través de la consola
- Las claves de desarrollo tienen límites de 500 solicitudes/mes

## Verificar que Funciona

1. Inicia sesión en tu aplicación
2. Abre DevTools (F12)
3. Busca en Console por "Clerk has been loaded"
4. Si dice "production" = ✅ Configurado correctamente
5. Si dice "development" = ❌ Aún usando claves de desarrollo
