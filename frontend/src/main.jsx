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
        // ✅ Corrige redirecciones post login/signup
        afterSignInUrl="/"
        afterSignUpUrl="/"
        signInUrl="/sign-in"
        signUpUrl="/sign-up"
        /**
         * 🚦 Corrección del enrutamiento Clerk + HashRouter
         * Mantiene navegación sin recargar toda la app
         */
        navigate={(to) => {
          console.log("🔁 Clerk intenta navegar a:", to);
          if (to.startsWith("#")) {
            window.location.hash = to; // no recarga
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
