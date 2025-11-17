// frontend/src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { HashRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const FRONTEND_API = import.meta.env.VITE_CLERK_FRONTEND_API;
if (!PUBLISHABLE_KEY) {
  throw new Error("❌ Falta la variable VITE_CLERK_PUBLISHABLE_KEY en .env");
}
if (!FRONTEND_API) {
  throw new Error("❌ Falta la variable VITE_CLERK_FRONTEND_API en .env");
}

// ✅ Opciones limpias, sin hacks ni domain incorrecto
const clerkOptions = {
  syncSessionWithTab: true,        // permite refrescar sesión entre pestañas
  sessionExpiredToast: true,       // muestra aviso si expira
  telemetry: false,
  navigate: (to) => (window.location.href = to), // navegación controlada
  afterSignOutUrl: "/#/",
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      frontendApi={FRONTEND_API}
      options={clerkOptions}
    >
      <HashRouter>
        <App />
      </HashRouter>
    </ClerkProvider>
  </React.StrictMode>
);
