// frontend/src/components/LogoutButton.jsx
import React from "react";
import { useClerk } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

export default function LogoutButton({ className = "" }) {
  const { signOut } = useClerk();
  const navigate = useNavigate();

  async function handleSignOut() {
    try {
      console.warn("DIAGNOSTIC signOut called from LogoutButton", { href: window.location.href, stack: new Error().stack });
      await signOut();
      console.warn("DIAGNOSTIC signOut completed (LogoutButton)", { href: window.location.href });
      // 🔹 Redirige correctamente dentro del HashRouter
      navigate("/");
    } catch (err) {
      console.error("Error al cerrar sesión en Clerk:", err);
    }
  }

  return (
    <button
      onClick={handleSignOut}
      className={className || "bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"}
    >
      Cerrar sesión
    </button>
  );
}
