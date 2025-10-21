// src/components/Register.jsx
import { useState } from "react";
import { apiFetch } from "../api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const data = await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role }),
    });

    if (data.message) {
      setMessage("✅ Registro exitoso, ya puedes iniciar sesión");
    } else {
      setMessage("❌ Error al registrarte");
    }
  }

  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      <h2>Registro</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        /><br />
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="student">Estudiante</option>
          <option value="teacher">Profesor</option>
        </select><br />
        <button type="submit">Registrarse</button>
      </form>
      <p>{message}</p>
    </div>
  );
}
