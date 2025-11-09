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

// 🚫 Desactivamos la navegación automática y el refresco de sesión
const clerkOptions = {
  syncSessionWithTab: false,
  sessionExpiredToast: false,
  telemetry: false,
  navigate: () => {},
  routerPush: () => {},
  routerReplace: () => {},
  signInForceRedirectUrl: "/#/courses",
  signUpForceRedirectUrl: "/#/courses",
  afterSignOutUrl: "/#/",
};

// 🚀 Render principal estable
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} options={clerkOptions}>
      <HashRouter>
        <App />
      </HashRouter>
    </ClerkProvider>
  </React.StrictMode>
);
