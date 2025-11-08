// frontend/src/components/CourseView.jsx
import { useEffect, useState } from "react";
import { getCourseBlocks } from "../api";

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

export default function CourseView({ courseId, clerkId }) {
  const [blocks, setBlocks] = useState([]);
  const [scores, setScores] = useState({}); // para guardar resultados de quizzes
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadBlocks = async () => {
      if (!clerkId) return;
      try {
        const data = await getCourseBlocks(courseId, clerkId);
        setBlocks(Array.isArray(data.blocks) ? data.blocks : []);
      } catch (err) {
        console.error("❌ Error cargando bloques:", err);
        setBlocks([]);
      }
    };
    if (courseId && clerkId) loadBlocks();
  }, [courseId, clerkId]);

  // Manejar respuestas del quiz
  const handleAnswer = (blockId, selectedIndex, correctIndex) => {
    const isCorrect = selectedIndex === correctIndex;
    setScores((prev) => ({
      ...prev,
      [blockId]: isCorrect ? 1 : 0,
    }));
    setMessage(isCorrect ? "✅ ¡Correcto!" : "❌ Incorrecto");
    setTimeout(() => setMessage(""), 1500);
  };

  // Calcular nota final (simple promedio de quizzes)
  const calculateFinalScore = () => {
    const quizIds = blocks.filter((b) => b.type === "quiz").map((b) => b.id);
    if (quizIds.length === 0) return 0;
    const correctCount = quizIds.filter((id) => scores[id] === 1).length;
    return ((correctCount / quizIds.length) * 100).toFixed(1);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded shadow">
      <h2 className="text-2xl font-bold text-green-700 mb-4">📚 Vista del curso</h2>

      {(blocks || []).length === 0 && (
        <p className="text-gray-500 text-center">No hay contenido disponible aún.</p>
      )}

      <div className="space-y-8">
        {(blocks || []).map((block) => (
          <div key={block.id} className="border rounded p-4 bg-gray-50">
            {block.type === "text" && (
              <p className="text-gray-800 whitespace-pre-wrap">{block.content}</p>
            )}

            {block.type === "image" && block.url && (
              <img
                src={block.url}
                alt="Imagen del curso"
                className="rounded max-h-96 mx-auto object-contain"
              />
            )}

            {block.type === "video" && block.url && (
              <div className="flex justify-center">
                <iframe
                  className="w-full h-64 rounded"
                  src={getYoutubeEmbedUrl(block.url)}
                  title="Video del curso"
                  allowFullScreen
                />
              </div>
            )}

            {block.type === "quiz" && (
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  {block.question?.trim() || "Pregunta sin texto"}
                </h3>
                {(block.options || []).map((opt, i) => (
                  <button
                    key={i}
                    className={`block w-full text-left border p-2 rounded mb-2 hover:bg-gray-100 ${
                      scores[block.id] !== undefined
                        ? i === block.correct
                          ? "bg-green-100 border-green-400"
                          : "bg-red-50"
                        : ""
                    }`}
                    onClick={() => handleAnswer(block.id, i, block.correct)}
                    disabled={scores[block.id] !== undefined}
                  >
                    {opt || `Opción ${i + 1}`}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Resultado final */}
      {Object.keys(scores).length > 0 && (
        <div className="mt-6 text-center text-lg font-semibold text-green-700">
          🧮 Tu puntuación: {calculateFinalScore()}%
        </div>
      )}

      {message && (
        <p className="mt-3 text-center text-blue-700 font-medium transition">{message}</p>
      )}
    </div>
  );
}
