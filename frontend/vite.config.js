// frontend/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 👇 importante: el nombre exacto del repo en GitHub
  base: "/centro-educativo-SAG/",

  // ✅ mejora: asegura compatibilidad total con hash routing y Clerk
  server: {
    port: 5173,
    open: true,
    host: true,
  },

  // ✅ mejora: útil para depurar errores en producción (opcional)
  build: {
    sourcemap: true,
  },
});
