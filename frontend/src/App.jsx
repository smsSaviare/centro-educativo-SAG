// frontend/src/App.jsx
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import CourseView from "./components/CourseView";
import CourseEditor from "./components/CourseEditor";
import Contacto from "./components/Contacto";
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

  // Clerk maneja automáticamente la renovación de tokens
  // Removido el refresh manual que causaba interrupciones en videos

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
                <Dashboard />
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
