// src/components/ResetPassword.jsx
import { useState, useEffect } from "react";
import { resetPassword } from "../api";
import { useNavigate, useLocation } from "react-router-dom";

export default function ResetPassword() {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Extrae el token de la URL con HashRouter
  useEffect(() => {
    const hash = location.hash; // ej: "#/reset-password?token=abc123"
    const queryString = hash.split("?")[1];
    const params = new URLSearchParams(queryString);
    const t = params.get("token");
    if (t) setToken(t);
  }, [location]);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("⏳ Restableciendo contraseña...");

    try {
      const data = await resetPassword(token, newPassword);

      if (data.message) {
        setMessage("✅ Contraseña restablecida con éxito");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage(`❌ ${data.error || "Error al restablecer la contraseña"}`);
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ No se pudo conectar con el servidor");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white p-6 md:p-10 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl md:text-3xl font-bold text-green-700 mb-6 text-center">
          Restablecer Contraseña
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            type="submit"
            className="w-full bg-green-700 text-white py-2 rounded font-semibold hover:bg-green-600 transition"
          >
            Restablecer
          </button>
        </form>
        {message && (
          <p className="mt-4 text-center text-red-500 break-words">{message}</p>
        )}
      </div>
    </div>
  );
}
