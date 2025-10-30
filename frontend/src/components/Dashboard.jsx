// src/components/Dashboard.jsx
import { useEffect, useState } from "react";
import { useUser, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { getMyCourses } from "../api";

export default function Dashboard() {
  const { user } = useUser();
  const clerkId = user?.id;
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const role = user?.publicMetadata?.role || "student";

  useEffect(() => {
    if (!clerkId) return;
    (async () => {
      try {
        const data = await getMyCourses(clerkId);
        setCourses(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [clerkId]);

  return (
    <>
      <SignedOut><RedirectToSignIn/></SignedOut>
      <SignedIn>
        <div className="p-6 min-h-screen">
          <h1 className="text-3xl font-bold text-green-700">Bienvenido {user.firstName || user.emailAddresses[0].emailAddress}</h1>

          {role === "teacher" && (
            <div className="mt-4">
              <button onClick={() => window.location.href = "#/editor"} className="bg-green-700 text-white px-4 py-2 rounded">Crear curso</button>
            </div>
          )}

          <section className="mt-6">
            {loading ? <p>Cargando...</p> :
              courses.length === 0 ? <p>No hay cursos</p> :
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map(c => (
                  <div key={c.id} className="bg-white p-4 rounded shadow">
                    <h3 className="text-xl font-semibold text-green-700">{c.title}</h3>
                    <p className="text-gray-600">{c.description}</p>
                    <a className="text-green-600 mt-2 inline-block" href={`#/course/${c.id}`}>Abrir</a>
                  </div>
                ))}
              </div>
            }
          </section>
        </div>
      </SignedIn>
    </>
  );
}
