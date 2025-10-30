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

// 🔧 URL base correcta para GitHub Pages
const BASE_URL = "https://smssaviare.github.io/centro-educativo-SAG/#";

function ClerkWithHashRouter() {
  const navigate = useNavigate();

  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      navigate={(to) => {
        console.log("🔁 Clerk intentó navegar a:", to);
        // 🔒 Redirección segura dentro del hash router
        if (to.startsWith("/")) {
          window.location.replace(`${BASE_URL}${to}`);
        } else if (to.startsWith("#")) {
          window.location.replace(`${BASE_URL}${to.substring(1)}`);
        } else {
          window.location.replace(`${BASE_URL}/${to}`);
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
