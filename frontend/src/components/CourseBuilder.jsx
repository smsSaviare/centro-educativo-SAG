// frontend/src/components/CourseBuilder.jsx
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { getCourseBlocks, saveCourseBlocks } from "../api";

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

export default function CourseBuilder({ courseId, clerkId }) {
  const [blocks, setBlocks] = useState([]);
  const [message, setMessage] = useState("");
  const [saveTimeout, setSaveTimeout] = useState(null);

  useEffect(() => {
    const loadBlocks = async () => {
      if (!clerkId) return;
      try {
        const data = await getCourseBlocks(courseId, clerkId);
        const normalized = Array.isArray(data.blocks)
          ? data.blocks.map((b) => ({
              id: b.id?.toString() || Date.now().toString(),
              type: b.type || "text",
              question: (b.question ?? b.content?.question ?? "") || "",
              options:
                Array.isArray(b.options) || Array.isArray(b.content?.options)
                  ? b.options || b.content?.options
                  : ["", ""],
              correct: typeof b.correct === "number" ? b.correct : (b.content?.correct ?? 0),
              url: b.url ?? b.content?.url ?? "",
              content:
                b.content ??
                (typeof b.content === "object" ? b.content.content ?? "" : b.content) ??
                "",
            }))
          : [];
        setBlocks(normalized);
      } catch (err) {
        console.error("❌ Error cargando bloques:", err);
        setBlocks([]);
      }
    };
    if (courseId && clerkId) loadBlocks();
  }, [courseId, clerkId]);

  const persistBlocks = async (newBlocks) => {
    if (!clerkId) return;
    try {
      console.log("💾 Guardando bloques:", newBlocks);
      await saveCourseBlocks(courseId, clerkId, newBlocks);
      setMessage("✅ Contenido guardado");
      setTimeout(() => setMessage(""), 2000);
    } catch (err) {
      console.error(err);
      setMessage("❌ Error al guardar");
    }
  };

  // Debounce para evitar múltiples guardados simultáneos
  const debouncedPersist = (newBlocks) => {
    if (saveTimeout) clearTimeout(saveTimeout);
    const newTimeout = setTimeout(() => {
      persistBlocks(newBlocks);
    }, 800);
    setSaveTimeout(newTimeout);
  };

  const addBlock = (type) => {
    const newBlock =
      type === "quiz"
        ? {
            id: Date.now().toString(),
            type: "quiz",
            questions: [
              { id: `${Date.now()}-0`, question: "", options: ["", ""], correct: 0 },
            ],
          }
        : { id: Date.now().toString(), type, content: "", url: "" };
    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    debouncedPersist(newBlocks);
  };

  const addBlockAt = (idx, type) => {
    const newBlock =
      type === "quiz"
        ? {
            id: Date.now().toString(),
            type: "quiz",
            questions: [
              { id: `${Date.now()}-0`, question: "", options: ["", ""], correct: 0 },
            ],
          }
        : { id: Date.now().toString(), type, content: "", url: "" };
    const newBlocks = [...blocks.slice(0, idx), newBlock, ...blocks.slice(idx)];
    setBlocks(newBlocks);
    debouncedPersist(newBlocks);
  };

  const updateBlock = (index, field, value) => {
    const newBlocks = [...blocks];
    // Support updating nested quiz questions
    if (field === "questions") {
      newBlocks[index] = { ...newBlocks[index], questions: value };
    } else {
      newBlocks[index] = { ...newBlocks[index], [field]: value };
    }
    setBlocks(newBlocks);
    debouncedPersist(newBlocks);
  };

  const removeBlock = (index) => {
    const newBlocks = blocks.filter((_, i) => i !== index);
    setBlocks(newBlocks);
    debouncedPersist(newBlocks);
  };

  // 🔥 Nuevo: manejar reordenamiento visual
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(blocks);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setBlocks(reordered);
    debouncedPersist(reordered);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded shadow">
      <h2 className="text-2xl font-bold text-green-700 mb-4">🧱 Constructor del curso</h2>

      <div className="flex flex-wrap gap-3 mb-4">
        <button onClick={() => addBlock("text")} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">➕ Texto</button>
        <button onClick={() => addBlock("image")} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">🖼️ Imagen</button>
        <button onClick={() => addBlock("video")} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">🎥 Video</button>
        <button onClick={() => addBlock("quiz")} className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700">❓ Quiz</button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="blocks">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-6">
              {blocks.map((block, index) => (
                <Draggable key={block.id} draggableId={block.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="border rounded p-4 relative bg-gray-50 hover:shadow transition"
                    >
                        {/* Add-toolbar before block: allow inserting blocks at this position */}
                        <div className="mb-3 flex gap-2">
                          <button onClick={() => addBlockAt(index, 'text')} className="text-sm bg-green-100 px-2 py-1 rounded">+ Texto</button>
                          <button onClick={() => addBlockAt(index, 'image')} className="text-sm bg-blue-100 px-2 py-1 rounded">+ Imagen</button>
                          <button onClick={() => addBlockAt(index, 'video')} className="text-sm bg-red-100 px-2 py-1 rounded">+ Video</button>
                          <button onClick={() => addBlockAt(index, 'quiz')} className="text-sm bg-purple-100 px-2 py-1 rounded">+ Quiz</button>
                        </div>
                      <button
                        onClick={() => removeBlock(index)}
                        className="absolute top-2 right-2 text-sm bg-red-500 text-white px-2 rounded hover:bg-red-600"
                      >
                        ✖
                      </button>

                      {block.type === "text" && (
                        <textarea
                          className="w-full border p-2 rounded"
                          placeholder="Escribe el texto aquí..."
                          value={block.content}
                          onChange={(e) => updateBlock(index, "content", e.target.value)}
                        />
                      )}

                      {block.type === "image" && (
                        <>
                          <input
                            type="text"
                            className="w-full border p-2 rounded"
                            placeholder="URL de la imagen"
                            value={block.url}
                            onChange={(e) => updateBlock(index, "url", e.target.value)}
                          />
                          {block.url && (
                            <img
                              src={block.url}
                              alt="Imagen"
                              className="mt-2 rounded max-h-64 object-contain"
                            />
                          )}
                        </>
                      )}

                      {block.type === "video" && (
                        <>
                          <input
                            type="text"
                            className="w-full border p-2 rounded"
                            placeholder="URL del video de YouTube"
                            value={block.url}
                            onChange={(e) => updateBlock(index, "url", e.target.value)}
                          />
                          {block.url && (
                            <iframe
                              className="w-full h-64 rounded"
                              src={getYoutubeEmbedUrl(block.url)}
                              title="Video del curso"
                              allowFullScreen
                            />
                          )}
                        </>
                      )}

                      {block.type === "quiz" && (
                        <div>
                          {/* Multiple questions within this quiz block */}
                          {(block.questions || []).map((q, qi) => (
                            <div key={q.id || qi} className="mb-3 border-b pb-2">
                              <input
                                type="text"
                                className="w-full border p-2 rounded mb-2"
                                placeholder={`Pregunta ${qi + 1}`}
                                value={q.question || ""}
                                onChange={(e) => {
                                  const newQs = [...(block.questions || [])];
                                  newQs[qi] = { ...newQs[qi], question: e.target.value };
                                  updateBlock(index, "questions", newQs);
                                }}
                              />

                              {(q.options || []).map((opt, i) => (
                                <div key={i} className="flex items-center gap-2 mb-1">
                                  <input
                                    type="radio"
                                    name={`correct-${block.id}-${qi}`}
                                    checked={q.correct === i}
                                    onChange={() => {
                                      const newQs = [...(block.questions || [])];
                                      newQs[qi] = { ...newQs[qi], correct: i };
                                      updateBlock(index, "questions", newQs);
                                    }}
                                  />
                                  <input
                                    type="text"
                                    className="border p-1 rounded flex-1"
                                    placeholder={`Opción ${i + 1}`}
                                    value={opt}
                                    onChange={(e) => {
                                      const newQs = [...(block.questions || [])];
                                      const newOpts = [...(newQs[qi].options || [])];
                                      newOpts[i] = e.target.value;
                                      newQs[qi] = { ...newQs[qi], options: newOpts };
                                      updateBlock(index, "questions", newQs);
                                    }}
                                  />
                                </div>
                              ))}

                              <div className="flex gap-2 mt-1">
                                <button
                                  className="text-sm text-blue-600 underline"
                                  onClick={() => {
                                    const newQs = [...(block.questions || []), { id: `${block.id}-${Date.now()}`, question: "", options: ["", ""], correct: 0 }];
                                    updateBlock(index, "questions", newQs);
                                  }}
                                >
                                  + Añadir otra pregunta al quiz
                                </button>
                                <button
                                  className="text-sm text-red-600 underline"
                                  onClick={() => {
                                    const newQs = [...(block.questions || [])];
                                    newQs.pop();
                                    updateBlock(index, "questions", newQs);
                                  }}
                                >
                                  - Quitar última pregunta
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {message && <p className="mt-3 text-center text-green-700 font-medium">{message}</p>}
    </div>
  );
}
