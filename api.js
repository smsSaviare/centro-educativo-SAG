// URL base del backend (Render)
export const API_URL = "https://sag-backend-b2j6.onrender.com";

// Función para hacer solicitudes
export async function apiFetch(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  return response.json();
}
