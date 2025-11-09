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

// ✅ URL completa de tu app en GitHub Pages
const FRONTEND_URL = "https://smssaviare.github.io/centro-educativo-SAG";

// 🚀 Render principal con logs detallados
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        // 👇 Fuerza dominio base correcto para handshake y cookies
        proxyUrl={`${FRONTEND_URL}/clerk`}
        // afterSignIn / SignUp / SignOut redirigen dentro del hash router
        afterSignInUrl="/"
        afterSignUpUrl="/"
        afterSignOutUrl="/"
        // 🔍 Logs adicionales para depurar navegación de Clerk
        navigate={(to, opts) => {
          console.log("📍 Clerk navigation intent:", to, opts);

          if (!to) {
            console.warn("⚠️ Clerk tried to navigate with empty path");
            return;
          }

          if (to.startsWith("http")) {
            console.warn("🌐 External redirect:", to);
            window.location.href = to;
            return;
          }

          if (to.startsWith("#")) {
            window.location.hash = to;
          } else if (to.startsWith("/")) {
            window.location.hash = `#${to}`;
          } else {
            window.location.hash = `#/${to}`;
          }

          console.log("✅ Hash updated to:", window.location.hash);
        }}
      >
        <App />
      </ClerkProvider>
    </HashRouter>
  </React.StrictMode>
);
