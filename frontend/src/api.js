const API_BASE_URL = "https://sag-backend-b2j6.onrender.com/api/auth"; // agrega /api/auth aquí

export async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  return res.json();
}

// Obtener cursos
export function getCourses() {
  return apiFetch("/courses"); // o "/api/courses" según tu backend
}

// Registro de usuario
export function registerUser(data) {
  return apiFetch("/register", { method: "POST", body: JSON.stringify(data) });
}

// Login de usuario
export function loginUser(data) {
  return apiFetch("/login", { method: "POST", body: JSON.stringify(data) });
}

// Forgot / Reset password
export function forgotPassword(email) {
  return apiFetch("/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
}

export function resetPassword(token, newPassword) {
  return apiFetch("/reset-password", { method: "POST", body: JSON.stringify({ token, newPassword }) });
}
