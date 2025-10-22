// src/components/Login.jsx
import { useState } from "react";
import { loginUser } from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("⏳ Verificando...");
    try {
      const data = await loginUser({ email, password });

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role); // guardar rol
        setMessage("✅ Inicio de sesión exitoso");

        // redirección según rol
        setTimeout(() => {
          if (data.role === "teacher") navigate("/editor");
          else navigate("/dashboard");
        }, 1000);
      } else {
        setMessage(`❌ ${data.error || "Credenciales inválidas"}`);
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ No se pudo conectar con el servidor");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-green-700 mb-6 text-center">
          Iniciar Sesión
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400 w-full"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400 w-full"
          />
          <button
            type="submit"
            className="bg-green-700 text-white py-2 rounded font-semibold hover:bg-green-600 transition w-full"
          >
            Entrar
          </button>
        </form>

        <p className="mt-4 text-center text-red-500">{message}</p>

        <p className="mt-4 text-center">
          <Link to="/forgot" className="text-green-700 hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </p>
      </div>
    </div>
  );
}
