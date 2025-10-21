// src/components/Dashboard.jsx
export default function Dashboard() {
  const token = localStorage.getItem("token");

  if (!token) {
    return (
      <div style={{ textAlign: "center", marginTop: "80px" }}>
        <p>No has iniciado sesión. 🔒</p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      <h2>Panel del Usuario</h2>
      <p>Bienvenido al Centro Educativo SAG 🎓</p>
      <button
        onClick={() => {
          localStorage.removeItem("token");
          window.location.href = "/";
        }}
      >
        Cerrar Sesión
      </button>
    </div>
  );
}
