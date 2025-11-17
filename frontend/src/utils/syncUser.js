// frontend/src/utils/syncUser.js
export async function syncUserToBackend(user, getToken) {
  try {
    const token = await getToken();
    const response = await fetch("https://TU_BACKEND.onrender.com/sync-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        clerkId: user.id,
        email: user.emailAddresses?.[0]?.emailAddress || "",
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        publicMetadata: user.publicMetadata || {},
      }),
    });
    return await response.json();
  } catch (error) {
    console.error("Error sincronizando usuario:", error);
  }
}
