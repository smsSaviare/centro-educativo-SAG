// frontend/src/components/CourseBuilder.jsx
import { useState, useEffect } from "react";
import { getCourseBlocks, saveCourseBlocks } from "../api";

export default function CourseBuilder({ courseId, clerkId }) {
  const [blocks, setBlocks] = useState([]);
  const [message, setMessage] = useState("");

  // Cargar bloques existentes
  useEffect(() => {
    const loadBlocks = async () => {
      if (!clerkId) return;
      try {
        const data = await getCourseBlocks(courseId, clerkId);
        setBlocks(Array.isArray(data.blocks) ? data.blocks : []);
      } catch (err) {
        console.error("❌ Error cargando bloques:", err);
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

  // Agregar bloque
  const addBlock = (type) => {
    const newBlock =
      type === "quiz"
        ? { id: Date.now().toString(), type: "quiz", question: "", options: ["", ""], correct: 0 }
        : { id: Date.now().toString(), type, content: "", url: "" };
    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    persistBlocks(newBlocks);
  };

  // Actualizar bloque
  const updateBlock = (index, field, value) => {
    const newBlocks = [...blocks];
    newBlocks[index][field] = value;
    setBlocks(newBlocks);
    persistBlocks(newBlocks);
  };

  // Eliminar bloque
  const removeBlock = (index) => {
    if (!window.confirm("¿Eliminar este bloque?")) return;
    const newBlocks = blocks.filter((_, i) => i !== index);
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
        {blocks.map((block, index) => (
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
                    className="w-full h-64 rounded mt-2"
                    src={block.url.replace("watch?v=", "embed/")}
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
                  value={block.question}
                  onChange={(e) => updateBlock(index, "question", e.target.value)}
                />
                {block.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2 mb-1">
                    <input
                      type="radio"
                      name={`correct-${index}`}
                      checked={block.correct === i}
                      onChange={() => updateBlock(index, "correct", i)}
                    />
                    <input
                      type="text"
                      className="border p-1 rounded flex-1"
                      placeholder={`Opción ${i + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...block.options];
                        newOpts[i] = e.target.value;
                        updateBlock(index, "options", newOpts);
                      }}
                    />
                  </div>
                ))}
                <button
                  className="mt-1 text-sm text-blue-600 underline"
                  onClick={() => updateBlock(index, "options", [...block.options, ""])}
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
