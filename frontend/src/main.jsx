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

// 🔧 URL base correcta para GitHub Pages
const BASE_URL = "https://smssaviare.github.io/centro-educativo-SAG/#";

// 🚀 Render principal
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        navigate={(to) => {
          console.log("🔁 Clerk intentó navegar a:", to);
          if (to.startsWith("/")) {
            window.location.replace(`${BASE_URL}${to}`);
          } else if (to.startsWith("#")) {
            window.location.replace(`${BASE_URL}${to.substring(1)}`);
          } else {
            window.location.replace(`${BASE_URL}/${to}`);
          }
        }}
      >
        <App />
      </ClerkProvider>
    </HashRouter>
  </React.StrictMode>
);
