// src/components/Dashboard.jsx
import { useEffect, useState } from "react";
import { getCourses } from "../api";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCourses() {
      try {
        const data = await getCourses();
        setCourses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-4xl font-bold text-green-700 mb-6 text-center">
        {role === "teacher" ? "Panel del Profesor" : "Mis Cursos"}
      </h1>

      {loading ? (
        <p className="text-center text-gray-500">Cargando cursos...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.length === 0 && (
            <p className="col-span-full text-center text-gray-500">
              No hay cursos disponibles.
            </p>
          )}
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white shadow-md rounded-xl p-4 hover:shadow-xl transition cursor-pointer"
              onClick={() => navigate(role === "teacher" ? "/editor" : `/course/${course.id}`)}
            >
              <h2 className="text-2xl font-semibold text-green-700">{course.title}</h2>
              <p className="text-gray-600 mt-2">{course.description}</p>
              <p className="mt-3 text-sm text-gray-400">
                {role === "teacher" ? "Haz clic para editar" : "Haz clic para ver"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
