// frontend/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 🧠 Detecta si el build es para GitHub Pages
const isGitHubPages = process.env.GITHUB_PAGES === "true";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // ⚙️ Base URL (solo para despliegue en GitHub Pages)
  base: isGitHubPages ? "/centro-educativo-SAG/" : "/",
  build: {
    outDir: "dist",
  },
  server: {
    port: 5173,
  },
});
