// src/components/ForgotPassword.jsx
import { useState } from "react";
import { forgotPassword } from "../api";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("⏳ Enviando token de recuperación...");

    try {
      const data = await forgotPassword(email);

      if (data.message) {
        setMessage("✅ Revisa tu correo para el token de recuperación");
        // Redirige a /reset-password, GH Pages usa HashRouter
        setTimeout(() => navigate("/reset-password"), 2000);
      } else {
        setMessage("❌ Ocurrió un error al enviar el token");
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
          Recuperar Contraseña
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            type="submit"
            className="w-full bg-green-700 text-white py-2 rounded font-semibold hover:bg-green-600 transition"
          >
            Enviar token
          </button>
        </form>
        {message && (
          <p className="mt-4 text-center text-red-500 break-words">{message}</p>
        )}
      </div>
    </div>
  );
}
