// src/api.js
// Centralización de llamadas al backend con Clerk + Fetch API

// ✅ Usa variable de entorno si existe, o el valor por defecto en Render
const API_BASE = import.meta.env.VITE_API_BASE || "https://sag-backend-b2j6.onrender.com/api/auth";

/**
 * Helper genérico para hacer peticiones al backend
 */
async function apiRequest(endpoint, { method = "GET", headers = {}, body, clerkId, token } = {}) {
  const url = `${API_BASE}${endpoint}`;
  const opts = { method, headers: { "Content-Type": "application/json", ...headers } };

  if (clerkId) opts.headers["x-clerk-id"] = clerkId;
  if (token) opts.headers["Authorization"] = `Bearer ${token}`;
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(url, opts);

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`Error ${res.status}: ${msg}`);
  }

  return res.json().catch(() => ({}));
}

/* ============================================================
   📚 Funciones específicas
   ============================================================ */

// Crear curso
export async function postCourse(payload, clerkId) {
  return apiRequest("/courses", {
    method: "POST",
    body: payload,
    clerkId,
  });
}

// Asignar estudiante a un curso
export async function assignStudent(courseId, studentClerkId, teacherClerkId) {
  return apiRequest(`/courses/${courseId}/assign`, {
    method: "POST",
    body: { studentClerkId },
    clerkId: teacherClerkId,
  });
}

// Obtener cursos del usuario actual
export async function getMyCourses(clerkId) {
  return apiRequest("/courses/my-courses", {
    method: "GET",
    clerkId,
  });
}

/* ============================================================
   👤 Autenticación y usuarios
   ============================================================ */

export async function registerUser(data) {
  return apiRequest("/register", { method: "POST", body: data });
}

export async function loginUser(data) {
  return apiRequest("/login", { method: "POST", body: data });
}

export async function forgotPassword(email) {
  return apiRequest("/forgot-password", { method: "POST", body: { email } });
}

export async function resetPassword(token, newPassword) {
  return apiRequest("/reset-password", {
    method: "POST",
    body: { token, newPassword },
  });
}

/* ============================================================
   🧠 Utilidades
   ============================================================ */

// Obtener todos los cursos (sin filtrar)
export function getCourses() {
  return apiRequest("/courses");
}

// Sincronizar usuario con backend (usado desde App.jsx)
export async function syncUserBackend(payload, token) {
  return apiRequest("/sync-user", { method: "POST", body: payload, token });
}

// Exporta para depuración
export { API_BASE };
