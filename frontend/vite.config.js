// frontend/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/centro-educativo-SAG/",
  build: {
    outDir: "dist",
  },
  server: {
    port: 5173,
  },
});
