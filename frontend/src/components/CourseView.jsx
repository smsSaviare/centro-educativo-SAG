// frontend/src/components/CourseView.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getCourseById, getCourseBlocks } from "../api";

export default function CourseView() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseData = await getCourseById(id);
        setCourse(courseData);

        const data = await getCourseBlocks(id);
        // Siempre aseguramos que blocks sea un array
        setBlocks(Array.isArray(data.blocks) ? data.blocks : []);
      } catch (err) {
        console.error("❌ Error cargando curso:", err);
        setBlocks([]); // fallback por si hay error
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <p className="text-gray-500 text-center">Cargando curso...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow">
      <h1 className="text-3xl font-bold mb-4">{course?.title || "Curso sin título"}</h1>
      <p className="text-gray-600 mb-6">{course?.description || "Sin descripción"}</p>

      {(blocks || []).length === 0 ? (
        <p className="text-gray-500 text-center">No hay contenido disponible.</p>
      ) : (
        <div className="space-y-6">
          {(blocks || []).map((b) => (
            <div key={b.id || Math.random()} className="p-4 border rounded-xl bg-gray-50">
              {b.type === "text" && <p>{b.content || ""}</p>}

              {b.type === "image" && b.url && (
                <img
                  src={b.url}
                  alt="Imagen del bloque"
                  className="rounded max-h-64 object-contain"
                />
              )}

              {b.type === "video" && b.url && (
                <iframe
                  className="w-full h-64 rounded"
                  src={b.url.replace("watch?v=", "embed/")}
                  title="Video del curso"
                  allowFullScreen
                />
              )}

              {b.type === "quiz" && (
                <div>
                  <p className="font-semibold">{b.question || "Pregunta sin texto"}</p>
                  <ul className="list-disc ml-6">
                    {(b.options || []).map((opt, i) => (
                      <li key={i}>{opt || "Opción vacía"}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
