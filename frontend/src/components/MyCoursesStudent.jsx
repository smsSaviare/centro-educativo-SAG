import { useEffect, useState } from "react";
import { useUser, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { getMyCourses } from "../api";

export default function MyCoursesStudent() {
  const { user } = useUser();
  const clerkId = user?.id;
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clerkId) return;
    (async () => {
      try {
        const data = await getMyCourses(clerkId);
        setCourses(data || []);
      } catch (e) {
        console.error("❌ Error cargando cursos:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [clerkId]);

  return (
    <>
      <SignedOut><RedirectToSignIn /></SignedOut>
      <SignedIn>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6 pt-24">
          <div className="max-w-6xl mx-auto">
            
            {/* Encabezado */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-green-800 mb-2">
                📚 Mis Cursos
              </h1>
              <p className="text-gray-600">
                Cursos a los que estás inscrito
              </p>
            </div>

            {/* Contenido */}
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Cargando cursos...</p>
              </div>
            ) : courses.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-600 mb-4 text-lg">No estás inscrito en ningún curso aún.</p>
                <p className="text-gray-500">Los cursos te aparecerán aquí cuando un profesor te asigne.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
                  >
                    {course.image && (
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-green-700 mb-2">
                        {course.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {course.description || "Sin descripción"}
                      </p>
                      <a
                        href={`#/course/${course.id}`}
                        className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                      >
                        Abrir curso →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SignedIn>
    </>
  );
}
