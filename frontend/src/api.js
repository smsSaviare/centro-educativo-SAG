// frontend/src/api.js
const API_BASE =
import.meta.env.VITE_API_BASE || "https://sag-backend-b2j6.onrender.com";

/**

* Helper genérico para hacer peticiones al backend
  */
  async function apiRequest(
  endpoint,
  { method = "GET", headers = {}, body, clerkId, token } = {}
  ) {
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
📚 Cursos
============================================================ */

// Crear curso
export async function postCourse(payload, clerkId) {
return apiRequest("/courses", { method: "POST", body: payload, clerkId });
}

// Obtener curso por ID
export async function getCourseById(courseId) {
  return apiRequest(`/courses/${courseId}`, { method: "GET" });
}

// Actualizar curso
export async function updateCourse(courseId, payload, clerkId) {
return apiRequest(`/courses/${courseId}`, { method: "PUT", body: payload, clerkId });
}

// Borrar un curso por id
export async function deleteCourse(courseId, clerkId) {
return apiRequest(`/courses/${courseId}`, { method: "DELETE", clerkId });
}

// Asignar estudiante(s) a un curso
export async function assignStudent(courseId, studentClerkId, teacherClerkId) {
return apiRequest(`/courses/${courseId}/assign`, {
method: "POST",
body: { studentClerkId },
clerkId: teacherClerkId,
});
}

// Obtener bloques de un curso
export async function getCourseBlocks(courseId, clerkId) {
  return apiRequest(`/courses/${courseId}/blocks`, { method: "GET", clerkId });
}

// Asignar un quizBlock a estudiante(s)
export async function assignQuizBlock(courseId, quizBlockId, studentClerkId, teacherClerkId) {
  return apiRequest(`/courses/${courseId}/blocks/${quizBlockId}/assign`, {
    method: "POST",
    body: { studentClerkId },
    clerkId: teacherClerkId,
  });
}

// Enviar resultado de un quiz (estudiante)
export async function submitQuizResult(courseId, clerkId, quizBlockId, score, answers) {
  return apiRequest(`/courses/${courseId}/quiz/submit`, {
    method: "POST",
    body: { clerkId, courseId, quizBlockId, score, answers },
    clerkId,
  });
}

// Obtener resultados del curso; si clerkId se pasa, filtra por estudiante
export async function getQuizResults(courseId, clerkId) {
  const query = clerkId ? `?clerkId=${encodeURIComponent(clerkId)}` : "";
  return apiRequest(`/courses/${courseId}/quiz/results${query}`, { method: "GET", clerkId });
}

// Guardar bloques de un curso
export const saveCourseBlocks = async (courseId, clerkId, blocks) => {
  // Si por algún motivo clerkId es array, tomar el primero
  const singleClerkId = Array.isArray(clerkId) ? clerkId[0] : clerkId;

  console.log("Guardando bloques:", { courseId, clerkId: singleClerkId, blocks });

  const res = await fetch(`${API_BASE}/courses/${courseId}/blocks`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-clerk-id": singleClerkId,
    },
    body: JSON.stringify({ clerkId: singleClerkId, blocks }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`Error ${res.status}: ${msg}`);
  }

  return res.json();
};

// Obtener cursos del usuario actual
export async function getMyCourses(clerkId) {
return apiRequest("/courses/my-courses", { method: "GET", clerkId });
}

// Obtener todos los estudiantes (para asignación)
export async function getStudents(clerkId) {
return apiRequest("/courses/students", { method: "GET", clerkId });
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
return apiRequest("/reset-password", { method: "POST", body: { token, newPassword } });
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
