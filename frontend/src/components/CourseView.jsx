// frontend/src/components/CourseView.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCourseById, getCourseBlocks, saveCourseBlocks } from "../api";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// Función auxiliar para reordenar array
const arrayMove = (arr, from, to) => {
  const newArr = [...arr];
  const [moved] = newArr.splice(from, 1);
  newArr.splice(to, 0, moved);
  return newArr;
};

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
        setBlocks(data.blocks || []);
      } catch (err) {
        console.error("❌ Error cargando curso:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const persistBlocks = async (blocksToSave) => {
  try {
    const clerkId = localStorage.getItem("clerkId"); // tu fuente real de clerkId
    if (!clerkId) throw new Error("No hay clerkId");

    const normalized = blocksToSave.map((b) => ({
      id: b.id,
      type: b.type || "text",
      content: b.content || "",
      url: b.url || "",
    }));

    console.log("Guardando bloques: ", { courseId: id, clerkId, blocks: normalized });

    await saveCourseBlocks(id, clerkId, normalized); // <-- orden corregido
  } catch (err) {
    console.error("❌ Error guardando bloques:", err);
  }
};


  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const newBlocks = arrayMove(blocks, result.source.index, result.destination.index);
    setBlocks(newBlocks);
    persistBlocks(newBlocks);
  };

  const handleBlockChange = (blockId, updatedBlock) => {
    const newBlocks = blocks.map((b) => (b.id === blockId ? updatedBlock : b));
    setBlocks(newBlocks);
    persistBlocks(newBlocks);
  };

  const addBlock = (type = "text") => {
    const newBlock = {
      id: Date.now().toString(),
      type,
      content: "",
      url: "",
    };
    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    persistBlocks(newBlocks);
  };

  if (loading) return <p className="text-gray-500 text-center">Cargando curso...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow">
      <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
      <p className="text-gray-600 mb-6">{course.description}</p>

      {/* Botones para agregar bloques */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => addBlock("text")} className="btn">Agregar Texto</button>
        <button onClick={() => addBlock("image")} className="btn">Agregar Imagen</button>
        <button onClick={() => addBlock("video")} className="btn">Agregar Video</button>
      </div>

      {!blocks || blocks.length === 0 ? (
        <p className="text-gray-500 text-center">Aquí se mostrará el contenido del curso 📘</p>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="blocks">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {blocks.map((b, index) => {
                  const content = b.content || "";

                  return (
                    <Draggable key={b.id} draggableId={b.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="my-6 p-4 border rounded-xl bg-gray-50"
                        >
                          {/* Renderizado según tipo */}
                          {b.type === "text" && (
                            <textarea
                              className="w-full p-2 border rounded"
                              value={content}
                              placeholder="Escribe aquí..."
                              onChange={(e) =>
                                handleBlockChange(b.id, { ...b, content: e.target.value })
                              }
                            />
                          )}

                          {b.type === "image" && (
                            <input
                              type="text"
                              className="w-full p-2 border rounded"
                              placeholder="URL de la imagen"
                              value={b.url || ""}
                              onChange={(e) =>
                                handleBlockChange(b.id, { ...b, url: e.target.value })
                              }
                            />
                          )}

                          {b.type === "video" && (
                            <input
                              type="text"
                              className="w-full p-2 border rounded"
                              placeholder="URL del video (YouTube)"
                              value={b.url || ""}
                              onChange={(e) =>
                                handleBlockChange(b.id, { ...b, url: e.target.value })
                              }
                            />
                          )}
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}
