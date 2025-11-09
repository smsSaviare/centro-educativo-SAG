// frontend/src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { HashRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("❌ Falta la variable VITE_CLERK_PUBLISHABLE_KEY en .env");
}

// ✅ Base URL para GitHub Pages (sin forzar redirección completa)
const BASE_URL = "https://smssaviare.github.io/centro-educativo-SAG/#";

// 🚀 Render principal
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        /**
         * 🚦 Corrección del enrutamiento Clerk + HashRouter
         * Clerk a veces intenta usar `window.location.assign`
         * pero en GitHub Pages debemos manipular solo el `hash`
         */
        navigate={(to) => {
          console.log("🔁 Clerk intenta navegar a:", to);
          if (to.startsWith("#")) {
            window.location.hash = to; // No recarga
          } else if (to.startsWith("/")) {
            window.location.hash = `#${to}`; // Navegación limpia
          } else {
            window.location.hash = `#/${to}`;
          }
        }}
      >
        <App />
      </ClerkProvider>
    </HashRouter>
  </React.StrictMode>
);
