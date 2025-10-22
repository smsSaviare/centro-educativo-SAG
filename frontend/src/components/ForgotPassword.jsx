import { useState } from "react";
import { forgotPassword } from "../api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("⏳ Enviando correo de recuperación...");

    try {
      const data = await forgotPassword(email);
      if (data.message) {
        setMessage("✅ Revisa tu correo: te hemos enviado un enlace para restablecer la contraseña");
      } else if (data.error) {
        setMessage(`❌ ${data.error}`);
      } else {
        setMessage("❌ Ocurrió un error inesperado");
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ No se pudo conectar con el servidor");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-10 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-green-700 mb-6 text-center">
          Recuperar Contraseña
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            type="submit"
            className="bg-green-700 text-white py-2 rounded font-semibold hover:bg-green-600 transition"
          >
            Enviar enlace
          </button>
        </form>
        <p className="mt-4 text-center text-red-500">{message}</p>
      </div>
    </div>
  );
}
