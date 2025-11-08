// frontend/src/components/CourseBuilder.jsx
import { useState, useEffect } from "react";
import { getCourseBlocks, saveCourseBlocks } from "../api";

// Convierte cualquier URL de YouTube a la versión embebida
// Convierte cualquier URL de YouTube a la versión embebida, ignorando parámetros extra
// Convierte cualquier URL de YouTube a la versión embebida
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

    // Limpiar IDs: solo letras, números, guiones y guiones bajos
    const sanitize = (id) => (id ? id.match(/[a-zA-Z0-9_-]+/g)?.join("") : null);
    videoId = sanitize(videoId);
    listId = sanitize(listId);

    if (!videoId && !listId) return "";

    if (listId && !videoId) {
      // Solo playlist
      return `https://www.youtube.com/embed/videoseries?list=${listId}`;
    }

    // Video individual (si tiene lista la agregamos)
    return `https://www.youtube.com/embed/${videoId}${listId ? `?list=${listId}` : ""}`;
  } catch {
    return "";
  }
};

console.log("embed fix")

export default function CourseBuilder({ courseId, clerkId }) {
  const [blocks, setBlocks] = useState([]);
  const [message, setMessage] = useState("");

useEffect(() => {
  const loadBlocks = async () => {
    if (!clerkId) return;
    try {
      const data = await getCourseBlocks(courseId, clerkId);
      const normalized = Array.isArray(data.blocks)
        ? data.blocks.map((b) => {
            // si vienen guardados con estructura antigua (content/url) lo acomodamos
            const base = {
              id: b.id?.toString() || Date.now().toString(),
              type: b.type || "text",
            };

            if (base.type === "quiz") {
              return {
                ...base,
                question: (b.question ?? b.content?.question ?? "") || "",
                options: Array.isArray(b.options)
                  ? b.options
                  : Array.isArray(b.content?.options)
                    ? b.content.options
                    : ["", ""],
                correct: typeof b.correct === "number" ? b.correct : (b.content?.correct ?? 0),
              };
            }

            if (base.type === "image" || base.type === "video") {
              return {
                ...base,
                url: b.url ?? b.content?.url ?? "",
              };
            }

            // texto u otros
            return {
              ...base,
              content: b.content ?? (typeof b.content === "object" ? b.content.content ?? "" : b.content) ?? "",
            };
          })
        : [];

      setBlocks(normalized);
    } catch (err) {
      console.error("❌ Error cargando bloques:", err);
      setBlocks([]); // fallback seguro
    }
  };
  if (courseId && clerkId) loadBlocks();
}, [courseId, clerkId]);


  // Guardar bloques automáticamente
  const persistBlocks = async (newBlocks) => {
    if (!clerkId) return;
    try {
      await saveCourseBlocks(courseId, clerkId, newBlocks);
      setMessage("✅ Contenido guardado");
      setTimeout(() => setMessage(""), 2000);
    } catch (err) {
      console.error(err);
      setMessage("❌ Error al guardar");
    }
  };

const addBlock = (type) => {
const newBlock =
  type === "quiz"
    ? {
        id: Date.now().toString(),
        type: "quiz",
        question: "",
        options: ["", ""],
        correct: 0
      }
    : { id: Date.now().toString(), type, content: "", url: "" };

  const newBlocks = [...(blocks || []), newBlock]; // <-- fallback a []
  setBlocks(newBlocks);
  persistBlocks(newBlocks);
};

const updateBlock = (index, field, value) => {
  const newBlocks = [...(blocks || [])];
  const currentBlock = newBlocks[index];

  // Asegurar que no se pierdan los datos anteriores
  newBlocks[index] = {
    ...currentBlock,
    [field]: value,
  };

  setBlocks(newBlocks);

  // Guardar en el backend el nuevo arreglo completo
  persistBlocks(newBlocks);
};


const removeBlock = (index) => {
  const newBlocks = (blocks || []).filter((_, i) => i !== index); // <-- fallback a []
  setBlocks(newBlocks);
  persistBlocks(newBlocks);
};

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded shadow">
      <h2 className="text-2xl font-bold text-green-700 mb-4">🧱 Constructor del curso</h2>

      {/* Botones para agregar bloques */}
      <div className="flex flex-wrap gap-3 mb-4">
        <button onClick={() => addBlock("text")} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">➕ Texto</button>
        <button onClick={() => addBlock("image")} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">🖼️ Imagen</button>
        <button onClick={() => addBlock("video")} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">🎥 Video</button>
        <button onClick={() => addBlock("quiz")} className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700">❓ Quiz</button>
      </div>

      {/* Render bloques */}
      <div className="space-y-6">
        {(blocks || []).map((block, index) => (
          <div key={block.id} className="border rounded p-4 relative bg-gray-50 hover:shadow transition">
            <button
              onClick={() => removeBlock(index)}
              className="absolute top-2 right-2 text-sm bg-red-500 text-white px-2 rounded hover:bg-red-600"
            >✖</button>

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
                {block.url && <img src={block.url} alt="Imagen" className="mt-2 rounded max-h-64 object-contain" />}
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
                    src={getYoutubeEmbedUrl(block.url)} // <-- aquí usamos la función robusta
                    title="Video del curso"
                    allowFullScreen
                  />
                )}
              </>
            )}


            {block.type === "quiz" && (
  <div>
    <input
      type="text"
      className="w-full border p-2 rounded mb-2"
      placeholder="Pregunta del quiz"
      value={block.question || ""}
      onChange={(e) => updateBlock(index, "question", e.target.value)}
    />

    {(block.options || []).map((opt, i) => (
      <div key={i} className="flex items-center gap-2 mb-1">
        <input
          type="radio"
          name={`correct-${block.id}`}
          checked={block.correct === i}
          onChange={() => updateBlock(index, "correct", i)}
        />
        <input
          type="text"
          className="border p-1 rounded flex-1"
          placeholder={`Opción ${i + 1}`}
          value={opt}
          onChange={(e) => {
            const newOpts = [...(block.options || [])];
            newOpts[i] = e.target.value;
            updateBlock(index, "options", newOpts);
          }}
        />
      </div>
    ))}

    <button
      className="mt-1 text-sm text-blue-600 underline"
      onClick={() => {
        const newOpts = [...(block.options || []), ""];
        updateBlock(index, "options", newOpts);
      }}
    >
      + Añadir opción
    </button>
  </div>
)}

          </div>
        ))}
      </div>

      {message && <p className="mt-3 text-center text-green-700 font-medium">{message}</p>}
    </div>
  );
}
