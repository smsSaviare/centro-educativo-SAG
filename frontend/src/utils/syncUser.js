export async function syncUserToBackend(user) {
  try {
    const response = await fetch("https://<TU_BACKEND>.onrender.com/sync-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.getToken ? await user.getToken() : ""}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error("Error sincronizando usuario:", error);
  }
}
