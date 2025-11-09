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

// ✅ Base URL de GitHub Pages
const BASE_URL = "https://smssaviare.github.io/centro-educativo-SAG/#";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        // 👇 Rutas por defecto después de login/registro/logout
        appearance={{
          layout: {
            socialButtonsPlacement: "bottom",
          },
        }}
        // 🔒 Evita redirecciones automáticas del SDK
        afterSignInUrl="/"
        afterSignUpUrl="/"
        afterSignOutUrl="/"
        navigate={(to, opts) => {
          console.log("📍 Clerk intenta navegar a:", to, opts);
          // Evitamos redirecciones "fantasma" que no vengan del usuario
          if (opts?.reason === "session") return;

          if (to.startsWith("#")) {
            window.location.hash = to;
          } else if (to.startsWith("/")) {
            window.location.hash = `#${to}`;
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
