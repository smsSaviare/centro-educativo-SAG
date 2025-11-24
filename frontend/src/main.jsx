// frontend/src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./App.css";
import { HashRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";

// ✅ Claves de Clerk configuradas
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const FRONTEND_API = import.meta.env.VITE_CLERK_FRONTEND_API;

if (!PUBLISHABLE_KEY) {
  throw new Error("❌ Falta VITE_CLERK_PUBLISHABLE_KEY");
}

console.log("🔐 Clerk:", PUBLISHABLE_KEY.includes("_live") ? "✅ PRODUCCIÓN" : "⚠️ DESARROLLO");

// ✅ Configuración para Producción con GitHub Pages
const clerkOptions = {
  syncSessionWithTab: true,
  sessionExpiredToast: true,
  telemetry: false,
  afterSignOutUrl: "/#/",
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      options={clerkOptions}
    >
      <HashRouter>
        <App />
      </HashRouter>
    </ClerkProvider>
  </React.StrictMode>
);
