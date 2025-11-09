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

// 🛡️ Interceptor para evitar reinicios automáticos de sesión
(function interceptClerkHandshake() {
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const url = args[0];
    if (typeof url === "string" && url.includes("__clerk_handshake")) {
      console.warn("🛡️ Clerk handshake bloqueado para mantener sesión estable");
      return new Response("OK", { status: 200 });
    }
    return originalFetch(...args);
  };
})();

// 🚀 Render principal
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        navigate={(to) => {
          console.log("🔁 Clerk intenta navegar a:", to);
          if (!to || to === "/" || to === "#/") {
            console.log("🧭 Ignorando navegación automática al home");
            return;
          }
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
          domain: "smssaviare.github.io",
        }}
      >
        <App />
      </ClerkProvider>
    </HashRouter>
  </React.StrictMode>
);

// 🛡️ Protección final contra redirecciones externas
let lastHash = window.location.hash;

// Escucha directa del evento de cambio de hash
window.addEventListener("hashchange", (event) => {
  const newHash = window.location.hash;

  // Si el cambio fue al home y no lo hizo React Router, lo revertimos
  if ((newHash === "#/" || newHash === "#") && lastHash !== "#/" && lastHash !== "#") {
    console.warn("⚠️ Cambio de hash externo detectado:", newHash);
    console.info("✅ Revirtiendo redirección al home...");
    window.location.hash = lastHash;
    return;
  }

  // Si el cambio es válido (usuario navegó), actualizamos
  lastHash = newHash;
});