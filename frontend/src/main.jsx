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

// 🧱 Bloquear solo el BroadcastChannel de Clerk (la causa real del reinicio)
const OriginalBroadcast = window.BroadcastChannel;
window.BroadcastChannel = function (name) {
  if (name && name.startsWith("__clerk")) {
    console.warn("🛑 Canal de Clerk bloqueado:", name);
    // Canal falso inerte
    return {
      name,
      postMessage: () => {},
      close: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      onmessage: null,
    };
  }
  return new OriginalBroadcast(name);
};

// Mantener visibilidad siempre activa (Clerk la usa para decidir revalidar)
Object.defineProperty(document, "visibilityState", {
  get: () => "visible",
});

// Configuración de Clerk
const clerkOptions = {
  syncSessionWithTab: false,
  sessionExpiredToast: false,
  telemetry: false,
  navigate: () => {}, // evita redirecciones automáticas
  signInForceRedirectUrl: "/#/courses",
  signUpForceRedirectUrl: "/#/courses",
  afterSignOutUrl: "/#/",
};


// 🚀 Render final, estable y funcional
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} options={clerkOptions}>
      <HashRouter>
        <App />
      </HashRouter>
    </ClerkProvider>
  </React.StrictMode>
);
