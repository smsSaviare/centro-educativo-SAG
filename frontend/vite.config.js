// frontend/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 🧠 Detecta automáticamente si estás en producción (GitHub Pages)
const isProduction = process.env.NODE_ENV === "production";

export default defineConfig({
  plugins: [react()],
  // 👇 Importante: base debe ser exactamente el nombre del repo en GitHub Pages
  base: isProduction ? "/centro-educativo-SAG/" : "/",
  build: {
    outDir: "dist",
  },
  server: {
    port: 5173,
  },
});
