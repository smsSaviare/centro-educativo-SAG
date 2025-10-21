// src/components/Home.jsx
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      <h1>Centro Educativo SAG 🎓</h1>
      <p>Aprendizaje práctico en la nube</p>

      <div style={{ marginTop: "40px" }}>
        <Link to="/login">
          <button>Iniciar Sesión</button>
        </Link>
        <Link to="/register" style={{ marginLeft: "10px" }}>
          <button>Registrarse</button>
        </Link>
      </div>
    </div>
  );
}
