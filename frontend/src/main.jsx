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

// ✅ Base URL para GitHub Pages
const BASE_URL = "https://smssaviare.github.io/centro-educativo-SAG/#";

// 🚀 Render principal
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        // 🚦 Corrige navegación del hash router
        navigate={(to) => {
          console.log("🔁 Clerk intenta navegar a:", to);

          // 🚫 Evita que Clerk fuerce volver al home automáticamente
          if (!to || to === "/" || to === "#/") {
            console.log("🧭 Ignorando navegación automática al home");
            return;
          }

          // ✅ Mantiene el comportamiento del HashRouter
          if (to.startsWith("#")) {
            window.location.hash = to;
          } else if (to.startsWith("/")) {
            window.location.hash = `#${to}`;
          } else {
            window.location.hash = `#/${to}`;
          }
        }}
        // ⚙️ Workaround: desactiva el refresco de sesión automático
        appearance={{
          variables: {
            colorPrimary: "#007bff",
          },
        }}
        options={{
          // 🔒 Clerk a veces intenta validar handshake al dominio raíz.
          // Esto fuerza a mantener la sesión mientras no haya un logout manual.
          syncSessionWithTab: false,
          sessionExpiredToast: false,
          telemetry: false,
        }}
      >
        <App />
      </ClerkProvider>
    </HashRouter>
  </React.StrictMode>
);
