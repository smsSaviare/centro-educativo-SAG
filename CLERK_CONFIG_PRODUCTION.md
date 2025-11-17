# ⚙️ Configuración de Clerk para Producción con GitHub Pages

## 🔴 Paso Crítico: Configurar URLs en Clerk Dashboard

Debes ir a **https://dashboard.clerk.com** y configurar lo siguiente:

### 1. **Allowed Origins** (Orígenes permitidos)
Estas son las URLs desde donde se carga tu aplicación:
- `https://smssaviare.github.io`
- `http://localhost:5173` (para desarrollo local)

### 2. **Allowed Redirect URLs** (URLs permitidas después de login)
Después de iniciar sesión, Clerk redirige a:
- `https://smssaviare.github.io`
- `https://smssaviare.github.io/#/`
- `https://smssaviare.github.io/#/dashboard`
- `http://localhost:5173`
- `http://localhost:5173/#/`

### 3. **API Origins** (Orígenes del API backend)
Tu backend que necesita validar tokens:
- `https://sag-backend-b2j6.onrender.com`
- `http://localhost:4000`

### 4. **Developer Metadata** (Opcional pero recomendado)
- `https://smssaviare.github.io` como dominio principal

---

## 📋 Variables de Entorno Actuales

**NUNCA commitees secretos a Git.** Las claves se configuran en:
- Frontend: Variables de entorno en GitHub Pages settings
- Backend: Variables de entorno en Render dashboard

### Frontend (.env - NO COMMITEAR):
```
VITE_CLERK_PUBLISHABLE_KEY=pk_live_... (tu clave)
VITE_API_BASE=https://sag-backend-b2j6.onrender.com
```

### Backend (.env - NO COMMITEAR):
```
CLERK_PUBLISHABLE_KEY=pk_live_... (tu clave)
CLERK_SECRET_KEY=sk_live_... (tu clave secreta)
```

---

## ✅ Checklist

- [ ] Configuré "Allowed Origins" en Clerk
- [ ] Configuré "Allowed Redirect URLs" en Clerk
- [ ] Configuré "API Origins" en Clerk
- [ ] Los botones de login aparecen en la página
- [ ] Puedo iniciar sesión correctamente
- [ ] La sesión persiste por más de 40 segundos

---

## 🚀 Después de Configurar en Clerk

1. Espera 1-2 minutos (Clerk propaga los cambios)
2. Limpia caché del navegador: `Ctrl+Shift+Delete`
3. Recarga la página: `F5`
4. Los botones de login deberían aparecer

## ❓ Si Aún No Funciona

1. Abre DevTools (F12)
2. Tab "Console"
3. Busca mensajes de Clerk
4. Si ves `ERR_CERT_COMMON_NAME_INVALID` = Problema de configuración de Clerk
5. Verifica que en Clerk Dashboard esté el dominio `smssaviare.github.io` exactamente igual
