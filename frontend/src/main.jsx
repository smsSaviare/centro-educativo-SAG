// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { HashRouter, useNavigate } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("❌ Falta la variable VITE_CLERK_PUBLISHABLE_KEY en .env");
}

// ✅ Custom wrapper para manejar Clerk + HashRouter sin conflictos
function ClerkWithHashRouter() {
  const navigate = useNavigate();

  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      navigate={(to) => {
        // Forzar navegación con hash (#)
        if (to.startsWith("/")) {
          window.location.hash = to;
        } else if (!to.startsWith("#")) {
          window.location.hash = `#${to}`;
        } else {
          window.location.hash = to;
        }
        navigate(to);
      }}
    >
      <App />
    </ClerkProvider>
  );
}

// 🚀 Render principal
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <ClerkWithHashRouter />
    </HashRouter>
  </React.StrictMode>
);
