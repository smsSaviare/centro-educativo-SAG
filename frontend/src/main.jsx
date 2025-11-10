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

// 🧱 Aislar Clerk, pero permitir navegación interna de React Router
class SafeClerkWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ready: false };
  }

  componentDidMount() {
    const blockedEvents = ["hashchange", "popstate", "beforeunload"];

    blockedEvents.forEach((eventType) => {
      window.addEventListener(
        eventType,
        (event) => {
          const newHash = window.location.hash;

          // Permitir solo cambios internos de la app (desde botones o links React)
          const fromReact = event.isTrusted && newHash.startsWith("#/");
          if (fromReact) return;

          // Bloquear redirecciones externas (Clerk u otras)
          if (newHash === "#/" || newHash === "#") {
            console.warn("🚫 Redirección externa bloqueada:", newHash);
            event.stopImmediatePropagation();
            event.preventDefault();
          }
        },
        true // Capture para interceptar antes que Clerk
      );
    });

    // Mantener página visible ante Clerk
    Object.defineProperty(document, "visibilityState", {
      get: () => "visible",
    });

    this.setState({ ready: true });
  }

  render() {
    if (!this.state.ready) return null;
    return this.props.children;
  }
}

const clerkOptions = {
  syncSessionWithTab: false,
  sessionExpiredToast: false,
  telemetry: false,
  navigate: () => {}, // Bloquea navegación externa
  signInForceRedirectUrl: "/#/courses",
  signUpForceRedirectUrl: "/#/courses",
  afterSignOutUrl: "/#/",
  domain: "smssaviare.github.io",
};

// 🚀 Render estable y funcional
ReactDOM.createRoot(document.getElementById("root")).render(
  <SafeClerkWrapper>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} options={clerkOptions}>
      <HashRouter>
        <App />
      </HashRouter>
    </ClerkProvider>
  </SafeClerkWrapper>
);
