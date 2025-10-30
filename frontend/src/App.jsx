// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import CourseView from "./components/CourseView";
import CourseEditor from "./components/CourseEditor";
import {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  useUser,
} from "@clerk/clerk-react";
import { useEffect } from "react";

/**
 * Sincroniza el usuario de Clerk con tu backend.
 */
async function syncUserToBackend(user) {
  try {
    const token = await user.getToken();
    const response = await fetch(
      "https://sag-backend-b2j6.onrender.com/sync-user",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clerkId: user.id,
          email:
            user.emailAddresses?.[0]?.emailAddress ||
            user.primaryEmailAddress ||
            "",
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          publicMetadata: user.publicMetadata || {},
        }),
      }
    );

    if (!response.ok) {
      console.warn("⚠️ No se pudo sincronizar usuario con backend");
      return;
    }

    const data = await response.json();
    console.log("✅ Usuario sincronizado:", data);
  } catch (error) {
    console.error("❌ Error sincronizando usuario:", error);
  }
}

/**
 * Requiere un rol específico desde publicMetadata.role
 */
function RequireRole({ user, role, children }) {
  const userRole = user?.publicMetadata?.role || null;
  if (userRole === role) return children;
  return <Dashboard />; // fallback si no tiene el rol correcto
}

function App() {
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    if (isSignedIn && user) syncUserToBackend(user);
  }, [isSignedIn, user]);

  return (
    <>
      <Navbar />
      <Routes>
        {/* Página principal */}
        <Route path="/" element={<Home />} />

        {/* Panel */}
        <Route
          path="/dashboard"
          element={
            <SignedIn>
              <Dashboard />
            </SignedIn>
          }
        />
        <Route
          path="/dashboard"
          element={
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          }
        />

        {/* Vista de curso */}
        <Route
          path="/course/:id"
          element={
            <SignedIn>
              <CourseView />
            </SignedIn>
          }
        />
        <Route
          path="/course/:id"
          element={
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          }
        />

        {/* Editor (solo profesores) */}
        <Route
          path="/editor"
          element={
            <SignedIn>
              <RequireRole user={user} role="teacher">
                <CourseEditor />
              </RequireRole>
            </SignedIn>
          }
        />
        <Route
          path="/editor"
          element={
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          }
        />
      </Routes>
    </>
  );
}

export default App;
