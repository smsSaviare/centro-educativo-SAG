// src/components/Register.jsx
import { useState } from "react";
import { registerUser } from "../api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [document, setDocument] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [role, setRole] = useState("student");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("⏳ Registrando usuario...");

    try {
      const data = await registerUser({
        name,
        document,
        email,
        password,
        phone,
        birthDate,
        role,
      });

      if (data.id) {
        setMessage("✅ Usuario registrado con éxito");
        // Guardar role localmente para PrivateRoute si deseas login automático
        localStorage.setItem("role", role);
        setTimeout(() => navigate("/login"), 1500);
      } else if (data.error) {
        setMessage(`❌ ${data.error}`);
      } else {
        setMessage("❌ Ocurrió un error al registrar");
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Error al conectarse al servidor");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-10 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-green-700 mb-6 text-center">
          Registrar Usuario
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Nombre completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            type="text"
            placeholder="Documento de identidad"
            value={document}
            onChange={(e) => setDocument(e.target.value)}
            required
            className="border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            type="tel"
            placeholder="Teléfono"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            type="date"
            placeholder="Fecha de nacimiento"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="student">Estudiante</option>
            <option value="teacher">Profesor</option>
          </select>
          <button
            type="submit"
            className="bg-green-700 text-white py-2 rounded font-semibold hover:bg-green-600 transition"
          >
            Registrarse
          </button>
        </form>
        <p className="mt-4 text-center text-red-500">{message}</p>
      </div>
    </div>
  );
}
