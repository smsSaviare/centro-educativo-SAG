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

// 🚀 Interceptor global para evitar handshake inválido
// Clerk intenta llamar a "?__clerk_handshake=..." en GitHub Pages → 404.
// Esto bloquea esa petición antes de que cause el reset.
(function interceptClerkHandshake() {
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const url = args[0];
    if (typeof url === "string" && url.includes("__clerk_handshake")) {
      console.warn("🛑 Clerk handshake bloqueado para evitar redirección");
      return new Response("OK", { status: 200 });
    }
    return originalFetch(...args);
  };
})();

// 🚦 Render principal
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        navigate={(to) => {
          console.log("🔁 Clerk intenta navegar a:", to);

          // 🚫 Evita redirección automática al home
          if (!to || to === "/" || to === "#/") {
            console.log("🧭 Ignorando navegación automática al home");
            return;
          }

          // ✅ Mantiene navegación correcta en HashRouter
          if (to.startsWith("#")) {
            window.location.hash = to;
          } else if (to.startsWith("/")) {
            window.location.hash = `#${to}`;
          } else {
            window.location.hash = `#/${to}`;
          }
        }}
        options={{
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
