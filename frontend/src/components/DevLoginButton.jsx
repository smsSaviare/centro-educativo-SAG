// frontend/src/components/DevLoginButton.jsx
import { useAuth } from "@clerk/clerk-react";

function DevLoginButton() {
  const { setSession } = useAuth();

  async function startDevSession() {
    const res = await fetch("https://tu-backend.onrender.com/api/dev-session", {
      method: "POST",
    });
    const { token } = await res.json();
    await setSession(token); // fuerza sesión persistente
  }

  return <button onClick={startDevSession}>Iniciar sesión de prueba</button>;
}

export default DevLoginButton;
