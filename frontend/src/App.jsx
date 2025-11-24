// frontend/src/App.jsx
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import MyCoursesStudent from "./components/MyCoursesStudent";
import CourseView from "./components/CourseView";
import CourseEditor from "./components/CourseEditor";
import Contacto from "./components/Contacto";
import StudentPanel from "./components/StudentPanel";
import {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  useUser,
  useAuth,
  SignIn,
  SignUp,
  UserProfile,
} from "@clerk/clerk-react";
import { useEffect } from "react";

async function syncUserToBackend(user, getToken) {
  try {
    const token = await getToken({ skipCache: true });
    const response = await fetch("https://sag-backend-b2j6.onrender.com/sync-user", {       
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
    });
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

function RequireRole({ user, role, children }) {
  const userRole = user?.publicMetadata?.role || null;
  if (userRole === role) return children;
  return <Dashboard />;
}

function App() {
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    if (isSignedIn && user) syncUserToBackend(user, getToken);
  }, [isSignedIn, user]);

  // Dispatch an event so other parts of the app (e.g. Dashboard) can refresh
  // when a user is synced with the backend.
  useEffect(() => {
    async function doSync() {
      if (isSignedIn && user) {
        await syncUserToBackend(user, getToken);
        try {
          window.dispatchEvent(new CustomEvent("userSynced", { detail: { clerkId: user.id } }));
        } catch (err) {
          console.warn("No se pudo emitir evento userSynced:", err);
        }
      }
    }

    doSync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, user]);

  // Clerk maneja automáticamente la renovación de tokens
  // Removido el refresh manual que causaba interrupciones en videos

  // Diagnostic listeners: detect what causes page unload/redirect/close
  useEffect(() => {
    const onBeforeUnload = (e) => {
      console.warn("DIAGNOSTIC beforeunload", e);
    };
    const onUnload = (e) => {
      console.warn("DIAGNOSTIC unload", e);
    };
    const onVisibility = () => {
      console.warn("DIAGNOSTIC visibilitychange", document.visibilityState);
    };
    const onHashChange = () => {
      console.warn("DIAGNOSTIC hashchange", window.location.hash);
    };
    const onPopState = (e) => {
      console.warn("DIAGNOSTIC popstate", window.location.href, e);
    };
    const onMessage = (ev) => {
      try {
        // Ignorar mensajes provenientes de extensiones u orígenes desconocidos.
        // Algunos mensajes de extensiones pueden provocar el warning: "A listener indicated an asynchronous response..."
        const origin = ev?.origin || "";
        if (
          origin.startsWith("chrome-extension://") ||
          origin.startsWith("moz-extension://") ||
          origin === "null" ||
          origin === ""
        ) {
          return; // noop para evitar interferencias con extensiones
        }
        console.warn("DIAGNOSTIC window.message", ev.origin, ev.data);
      } catch (err) {
        console.warn("DIAGNOSTIC window.message (error reading)", err);
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("unload", onUnload);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("popstate", onPopState);
    window.addEventListener("message", onMessage);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("unload", onUnload);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("message", onMessage);
    };
  }, []);

  // DIAGNOSTIC: log cambios en el estado de sesión para detectar cuándo se pierde
  useEffect(() => {
    try {
      const ts = new Date().toISOString();
      const userId = user?.id || null;
      console.warn("DIAGNOSTIC sessionChange", { ts, isSignedIn, userId });
    } catch (err) {
      console.warn("DIAGNOSTIC sessionChange (error)", err);
    }
  }, [isSignedIn, user]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contacto" element={<Contacto />} />

        {/* Clerk UI para probar autenticación */}
        <Route path="/sign-in" element={<SignIn routing="hash" />} />
        <Route path="/sign-up" element={<SignUp routing="hash" />} />
        <Route path="/user" element={<UserProfile routing="hash" />} />

        <Route
          path="/courses"
          element={
            <>
              <SignedIn>
                {user?.publicMetadata?.role === "teacher" ? <Dashboard /> : <MyCoursesStudent />}
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        <Route
          path="/dashboard"
          element={
            <>
              <SignedIn>
                <Dashboard />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        <Route
          path="/student-panel"
          element={
            <>
              <SignedIn>
                <StudentPanel />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        <Route
          path="/course/:id"
          element={
            <>
              <SignedIn>
                <CourseView />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        <Route
          path="/editor"
          element={
            <>
              <SignedIn>
                <RequireRole user={user} role="teacher">
                  <CourseEditor />
                </RequireRole>
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        <Route
          path="/logout"
          element={
            <>
              {(() => {
                // Evitar borrar storage automáticamente: mostrar confirmación
                // Si algo navega a /logout accidentalmente, esto previene cierre/recarga
                return (
                  <div className="max-w-2xl mx-auto p-6 mt-20 text-center">
                    <h2 className="text-2xl font-bold mb-4">Confirmar cierre de sesión</h2>
                    <p className="mb-4">¿Estás seguro de que deseas cerrar sesión? Presiona el botón para confirmar.</p>
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => {
                          try {
                            localStorage.clear();
                            window.location.hash = "#/";
                          } catch (err) {
                            console.error("Error al cerrar sesión desde /logout:", err);
                          }
                        }}
                        className="bg-red-500 text-white px-4 py-2 rounded"
                      >
                        Confirmar cierre de sesión
                      </button>
                      <button
                        onClick={() => (window.location.hash = "#/")}
                        className="bg-gray-200 px-4 py-2 rounded"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                );
              })()}
            </>
          }
        />
      </Routes>
    </>
  );
}

export default App;
