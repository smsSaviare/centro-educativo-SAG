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
 * Componente que requiere un rol específico desde publicMetadata.role
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
        {/* 🏠 Página principal */}
        <Route path="/" element={<Home />} />

        {/* 📊 Panel de control */}
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

        {/* 📚 Vista del curso */}
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

        {/* ✏️ Editor de cursos (solo profesores) */}
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

        {/* 🚪 Redirección segura para logout (sin 404) */}
        <Route
          path="/logout"
          element={
            <>
              {(() => {
                localStorage.clear();
                window.location.hash = "#/";
                return null;
              })()}
            </>
          }
        />
      </Routes>
    </>
  );
}

export default App;
