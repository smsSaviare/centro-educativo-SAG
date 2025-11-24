// frontend/src/components/CourseView.jsx
import { useState, useEffect, useCallback } from "react";
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
  const [answersMap, setAnswersMap] = useState({}); // map blockId -> array of selected indices per question
  const [showMyGrades, setShowMyGrades] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState({});
  const [assignedMap, setAssignedMap] = useState({});
  const [allResults, setAllResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignSelects, setAssignSelects] = useState({});
  const [message, setMessage] = useState("");
  const { user, isSignedIn } = useUser();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const courseData = await getCourseById(id);
      setCourse(courseData);

      const data = await getCourseBlocks(id);
      console.log("🧩 Datos de bloques recibidos:", data?.blocks);
      const normalized = (Array.isArray(data?.blocks) ? data.blocks : []).map((b) => {
        if (b.type === 'quiz') {
          // normalize questions array
          const qs = Array.isArray(b.questions)
            ? b.questions.map((q, qi) => ({
                id: q.id ?? `${b.id}-${qi}`,
                question: q.question || q.text || 'Pregunta sin texto',
                options: Array.isArray(q.options) ? q.options : ['',''],
                correct: typeof q.correct === 'number' ? q.correct : 0,
              }))
            : [ { id: `${b.id}-0`, question: b.question || b.content || 'Pregunta sin texto', options: Array.isArray(b.options) ? b.options : ['',''], correct: b.correct ?? 0 } ];
          return { ...b, questions: qs };
        }
        if (b.type === 'text') return { ...b, content: b.content || '' };
        if (b.type === 'video' || b.type === 'image') return { ...b, url: b.url || '' };
        return b;
      });
      setBlocks(normalized);

      // Cargar resultados/assignaciones si el usuario está logueado
      if (isSignedIn && user) {
        const myResults = await getQuizResults(id, user.id).catch(() => []);
        const map = {};
        (myResults || []).forEach((r) => {
          map[r.quizBlockId] = r;
        });
        setAssignedMap(map);

        // Si soy profesor, cargar todos los resultados y lista de estudiantes
        const userRole = user.publicMetadata?.role;
        if (userRole === "teacher") {
          const all = await getQuizResults(id).catch(() => []);
          setAllResults(all || []);
          const studs = await getStudents(user.id).catch(() => []);
          setStudents(studs || []);
          // inicializar selects controlados
          const selects = {};
          (all || []).forEach((r) => {
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
  }, [id, isSignedIn, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
        <div className="text-center">
          <p className="text-gray-500">No hay contenido disponible.</p>
          <p className="text-sm text-gray-400 mt-2">Si esto no es correcto, puede ser un problema en el servidor o en la API.</p>
          <div className="mt-3">
            <button
              onClick={() => fetchData()}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500"
            >
              Reintentar cargar contenido
            </button>
          </div>
        </div>
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

              {/* Quiz: multi-question support */}
              {b.type === 'quiz' && (
                <div>
                  {(b.questions || []).map((q, qi) => {
                    const assigned = assignedMap[b.id];
                    const completed = assigned && assigned.attempts >= assigned.maxAttempts;
                    const selected = (answersMap[b.id] && answersMap[b.id][qi]) ?? null;
                    return (
                      <div key={q.id || qi} className="mb-4">
                        <p className="font-semibold mb-2">{q.question || 'Pregunta sin texto'}</p>
                        {(q.options || []).map((opt, i) => (
                          <button
                            key={i}
                            className={`block w-full text-left border p-2 rounded mb-2 transition-colors ${!completed ? 'hover:bg-gray-100 cursor-pointer' : 'cursor-not-allowed opacity-60'} ${selected === i ? 'bg-blue-100 border-blue-400' : ''}`}
                            onClick={() => {
                              if (!isSignedIn || !user) return setMessage('Debes iniciar sesión para responder');
                              if (completed) return;
                              setAnswersMap(prev => {
                                const copy = { ...(prev || {}) };
                                copy[b.id] = copy[b.id] || [];
                                copy[b.id][qi] = i;
                                return copy;
                              });
                            }}
                            disabled={completed}
                          >
                            {opt !== '' ? opt : `Opción ${i+1}`}
                          </button>
                        ))}
                      </div>
                    );
                  })}

                  <div className="flex gap-3 items-center mt-2">
                    <button
                      className="bg-green-600 text-white px-4 py-2 rounded"
                      onClick={async () => {
                        if (!isSignedIn || !user) return setMessage('Debes iniciar sesión');
                        const selectedArr = (answersMap[b.id] || []).slice(0, (b.questions || []).length);
                        let correctCount = 0;
                        (b.questions || []).forEach((q, qi) => {
                          if (selectedArr[qi] !== undefined && selectedArr[qi] === q.correct) correctCount++;
                        });
                        const score = (b.questions && b.questions.length > 0) ? (correctCount / b.questions.length) : 0;
                        try {
                          const res = await submitQuizResult(id, user.id, b.id, score, { answers: selectedArr });
                          if (res && res.success) {
                            const myResults = await getQuizResults(id, user.id);
                            const map = {};
                            (myResults || []).forEach(r => { map[r.quizBlockId] = r; });
                            setAssignedMap(map);
                            setMessage('✅ Respuestas enviadas.');
                            setTimeout(() => setMessage(''), 2000);
                          } else {
                            setMessage('Error al enviar respuestas');
                          }
                        } catch (err) {
                          console.error('Error enviando quiz:', err);
                          setMessage('Error enviando respuestas');
                        }
                      }}
                    >Enviar respuestas</button>

                    <button
                      className="bg-gray-200 px-3 py-2 rounded"
                      onClick={async () => {
                        // Toggle student's grades view
                        if (!isSignedIn || !user) return setMessage('Debes iniciar sesión');
                        if (!showMyGrades) {
                          const my = await getQuizResults(id, user.id).catch(() => []);
                          setAllResults(my || []);
                        } else {
                          await fetchData();
                        }
                        setShowMyGrades(prev => !prev);
                      }}
                    >{showMyGrades ? 'Ocultar mis notas' : 'Ver mis notas'}</button>
                  </div>

                  {/* Si soy profesor, mostrar controles de asignación y resultados por estudiante */}
                  {user?.publicMetadata?.role === "teacher" && (
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
