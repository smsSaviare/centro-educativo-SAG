// frontend/src/components/CourseView.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getCourseById, getCourseBlocks } from "../api";

// Convierte URL de YouTube a embed
const getYoutubeEmbedUrl = (url) => {
  if (!url) return "";
  try {
    const u = new URL(url);
    const hostname = u.hostname.toLowerCase();
    let videoId = null;
    let listId = null;

    if (hostname.includes("youtube.com")) {
      videoId = u.searchParams.get("v");
      listId = u.searchParams.get("list");
    } else if (hostname.includes("youtu.be")) {
      videoId = u.pathname.slice(1);
      listId = u.searchParams.get("list");
    }

    const sanitize = (id) => (id ? id.match(/[a-zA-Z0-9_-]+/g)?.join("") : null);
    videoId = sanitize(videoId);
    listId = sanitize(listId);

    if (!videoId && !listId) return "";

    if (listId && !videoId) {
      return `https://www.youtube.com/embed/videoseries?list=${listId}`;
    }

    return `https://www.youtube.com/embed/${videoId}${listId ? `?list=${listId}` : ""}`;
  } catch {
    return "";
  }
};

export default function CourseView() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseData = await getCourseById(id);
        setCourse(courseData);

        const data = await getCourseBlocks(id);
        console.log("🧩 Datos de bloques recibidos:", data.blocks);
        setBlocks(
          Array.isArray(data.blocks)
            ? data.blocks.map((b) => ({
                ...b,
                question: b.question || "Pregunta sin texto",
                options: Array.isArray(b.options)
                  ? b.options
                  : ["Opción 1", "Opción 2"],
              }))
            : []
        );
      } catch (err) {
        console.error("❌ Error cargando curso:", err);
        setBlocks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAnswer = (blockId, selectedIndex, correctIndex) => {
    const isCorrect = selectedIndex === correctIndex;
    setScores((prev) => ({
      ...prev,
      [blockId]: isCorrect ? 1 : 0,
    }));
    setMessage(isCorrect ? "✅ ¡Correcto!" : "❌ Incorrecto");
    setTimeout(() => setMessage(""), 1500);
  };

  const calculateFinalScore = () => {
    const quizIds = blocks.filter((b) => b.type === "quiz").map((b) => b.id);
    if (quizIds.length === 0) return 0;
    const correctCount = quizIds.filter((id) => scores[id] === 1).length;
    return ((correctCount / quizIds.length) * 100).toFixed(1);
  };

  if (loading)
    return <p className="text-gray-500 text-center">Cargando curso...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow">
      <h1 className="text-3xl font-bold mb-4">
        {course?.title || "Curso sin título"}
      </h1>
      <p className="text-gray-600 mb-6">
        {course?.description || "Sin descripción"}
      </p>

      {(blocks || []).length === 0 ? (
        <p className="text-gray-500 text-center">
          No hay contenido disponible.
        </p>
      ) : (
        <div className="space-y-6">
          {(blocks || []).map((b) => (
            <div
              key={b.id || Math.random()}
              className="p-4 border rounded-xl bg-gray-50"
            >
              {/* Texto */}
              {b.type === "text" && <p>{b.content || ""}</p>}

              {/* Imagen */}
              {b.type === "image" && b.url && (
                <img
                  src={b.url}
                  alt="Imagen del bloque"
                  className="rounded max-h-64 object-contain"
                />
              )}

              {/* Video */}
              {b.type === "video" && b.url && (
                <iframe
                  className="w-full h-64 rounded"
                  src={getYoutubeEmbedUrl(b.url)}
                  title="Video del curso"
                  allowFullScreen
                />
              )}

              {/* Quiz */}
              {b.type === "quiz" && (
                <div>
                  <p className="font-semibold mb-2">
                    {b.question !== ""
                      ? b.question
                      : "Pregunta sin texto"}
                  </p>
                  {(b.options || []).map((opt, i) => (
                    <button
                      key={i}
                      className={`block w-full text-left border p-2 rounded mb-2 hover:bg-gray-100 ${
                        scores[b.id] !== undefined
                          ? i === b.correct
                            ? "bg-green-100 border-green-400"
                            : "bg-red-50"
                          : ""
                      }`}
                      onClick={() => handleAnswer(b.id, i, b.correct)}
                      disabled={scores[b.id] !== undefined}
                    >
                      {opt !== "" ? opt : `Opción ${i + 1}`}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Resultado final */}
      {Object.keys(scores).length > 0 && (
        <div className="mt-6 text-center text-lg font-semibold text-green-700">
          🧮 Tu puntuación: {calculateFinalScore()}%
        </div>
      )}

      {message && (
        <p className="mt-3 text-center text-blue-700 font-medium transition">
          {message}
        </p>
      )}
    </div>
  );
}
