// frontend/src/components/CourseView.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getCourseById, getCourseBlocks, getQuizResults, submitQuizResult, assignQuizBlock, getStudents } from "../api";
import { useUser } from "@clerk/clerk-react";

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
  const [assignedMap, setAssignedMap] = useState({});
  const [allResults, setAllResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignSelects, setAssignSelects] = useState({});
  const [message, setMessage] = useState("");
  const { user, isSignedIn } = useUser();

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
              // Cargar resultados/assignaciones si el usuario está logueado
              if (isSignedIn && user) {
                const myResults = await getQuizResults(id, user.id);
                const map = {};
                (myResults || []).forEach((r) => {
                  map[r.quizBlockId] = r;
                });
                setAssignedMap(map);

                // Si soy el profesor creador, cargar todos los resultados y lista de estudiantes
                if (courseData && courseData.creatorClerkId === user.id) {
                  const all = await getQuizResults(id);
                  setAllResults(all || []);
                  const studs = await getStudents(user.id);
                  setStudents(studs || []);
                  // inicializar selects controlados
                  const selects = {};
                  (all || []).forEach(r => {
                    selects[r.quizBlockId] = selects[r.quizBlockId] || "";
                  });
                  setAssignSelects(selects);
                }
              }
      } catch (err) {
        console.error("❌ Error cargando curso:", err);
        setBlocks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAnswer = async (blockId, selectedIndex, correctIndex) => {
    const isCorrect = selectedIndex === correctIndex;
    const scoreVal = isCorrect ? 1 : 0;

    // Si hay asignación, intentar enviar resultado
    try {
      if (!isSignedIn || !user) {
        setMessage("Debes iniciar sesión para enviar el resultado");
        return;
      }

      const assigned = assignedMap[blockId];
      if (!assigned) {
        console.warn("⚠️ No estás asignado a este quiz, blockId:", blockId);
        setMessage("No estás asignado a este quiz");
        return;
      }

      // Verificar si ya se respondió (score !== null o attempts >= maxAttempts)
      if (assigned.attempts >= assigned.maxAttempts) {
        setMessage("Ya completaste este quiz");
        return;
      }

      console.log("📤 Enviando respuesta:", { blockId, selectedIndex, correctIndex, scoreVal, userId: user.id });
      const res = await submitQuizResult(id, user.id, blockId, scoreVal, { selectedIndex });
      console.log("✅ Respuesta recibida del servidor:", res);
      
      if (res && res.success) {
        // actualizar mapa local
        setAssignedMap((prev) => ({ ...prev, [blockId]: res.result }));
        setScores((prev) => ({ ...prev, [blockId]: scoreVal }));
        setMessage(isCorrect ? "✅ ¡Correcto!" : "❌ Incorrecto");
        setTimeout(() => setMessage(""), 1500);
      } else {
        console.error("❌ Respuesta sin éxito:", res);
        setMessage("Error: " + (res?.error || "No se pudo guardar"));
        setTimeout(() => setMessage(""), 2000);
      }
    } catch (err) {
      console.error("❌ Error en handleAnswer:", err);
      setMessage(err.message || "Error enviando resultado");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  const handleAssign = async (blockId, studentClerkId) => {
    try {
      if (!isSignedIn || !user) return setMessage("Debes iniciar sesión como profesor");
      await assignQuizBlock(id, blockId, studentClerkId, user.id);
      setMessage("Asignación realizada");
      // refrescar resultados
      const all = await getQuizResults(id);
      setAllResults(all || []);
      const myResults = await getQuizResults(id, user.id);
      const map = {};
      (myResults || []).forEach((r) => (map[r.quizBlockId] = r));
      setAssignedMap(map);
      setTimeout(() => setMessage(""), 1500);
    } catch (err) {
      console.error(err);
      setMessage("Error asignando quiz");
      setTimeout(() => setMessage(""), 2000);
    }
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
                  {(b.options || []).map((opt, i) => {
                    const assigned = assignedMap[b.id];
                    
                    // Solo deshabilitar si ya se respondió (attempts >= maxAttempts)
                    const completed = assigned && assigned.attempts >= assigned.maxAttempts;
                    
                    // Mostrar estilos de resultado si está completado
                    const showResultStyle = completed;
                    const isCorrect = assigned && assigned.score === 1;
                    const isSelectedOption = assigned && assigned.answers && assigned.answers.selectedIndex === i;

                    return (
                      <button
                        key={i}
                        className={`block w-full text-left border p-2 rounded mb-2 transition-colors ${
                          !completed ? "hover:bg-gray-100 cursor-pointer" : "cursor-not-allowed opacity-60"
                        } ${
                          showResultStyle && isSelectedOption
                            ? isCorrect 
                              ? "bg-green-200 border-green-500 font-semibold"
                              : "bg-red-200 border-red-500 font-semibold"
                            : showResultStyle && i === b.correct
                            ? "bg-green-100 border-green-400"
                            : ""
                        }`}
                        onClick={() => !completed && handleAnswer(b.id, i, b.correct)}
                        disabled={completed}
                      >
                        {opt !== "" ? opt : `Opción ${i + 1}`}
                      </button>
                    );
                  })}

                  {/* Si soy el profesor creador, mostrar controles de asignación y resultados por estudiante */}
                  {course?.creatorClerkId === user?.id && (
                    <div className="mt-3 border-t pt-3">
                      <h4 className="font-semibold">Asignar este quiz a un estudiante</h4>
                      <div className="flex gap-2 mt-2">
                        <select
                          value={assignSelects[b.id] || ""}
                          onChange={(e) => setAssignSelects(prev => ({ ...prev, [b.id]: e.target.value }))}
                          className="border p-1 rounded flex-1"
                        >
                          <option value="">Seleccionar estudiante</option>
                          {students.map((s) => (
                            <option key={s.clerkId} value={s.clerkId}>{`${s.firstName || ''} ${s.lastName || ''} (${s.email})`}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            const selValue = assignSelects[b.id];
                            if (selValue) handleAssign(b.id, selValue);
                          }}
                          className="bg-green-600 text-white px-3 py-1 rounded"
                        >
                          Asignar
                        </button>
                      </div>

                      <div className="mt-3">
                        <h5 className="font-semibold">Resultados</h5>
                        <table className="w-full text-sm mt-2">
                          <thead>
                            <tr className="text-left">
                              <th>Estudiante</th>
                              <th>Nota</th>
                              <th>Completado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allResults.filter(r => r.quizBlockId === b.id).map((r) => (
                              <tr key={`${b.id}-${r.clerkId}`}>
                                <td>{r.student ? `${r.student.firstName} ${r.student.lastName}` : r.clerkId}</td>
                                <td>{r.score === null || r.score === undefined ? '—' : (r.score * 100) + '%'}</td>
                                <td>{r.completedAt ? '✅' : '⏳'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
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
