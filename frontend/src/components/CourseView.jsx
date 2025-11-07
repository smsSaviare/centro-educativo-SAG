// frontend/src/components/CourseView.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCourseById, getCourseBlocks, saveCourseBlocks } from "../api";

// @dnd-kit imports
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableBlock({ block, onChange }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginBottom: "1.5rem",
  };

  const handleTextChange = (e) => {
    onChange(block.id, { ...block, content: e.target.value });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-4 border rounded-xl shadow-sm bg-gray-50"
    >
      {block.type === "text" && (
        <textarea
          className="w-full p-2 rounded-md border border-gray-300 resize-none"
          value={block.content}
          onChange={handleTextChange}
          rows={3}
        />
      )}

      {block.type === "image" && block.url && (
        <img
          src={block.url}
          alt="Contenido del curso"
          className="rounded-2xl shadow-md max-h-[400px] w-full object-contain"
        />
      )}

      {block.type === "video" && block.url && (
        <iframe
          width="560"
          height="315"
          src={block.url.replace("watch?v=", "embed/")}
          title="Video del curso"
          frameBorder="0"
          allowFullScreen
          className="rounded-2xl shadow-md w-full"
        ></iframe>
      )}
    </div>
  );
}

export default function CourseView() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [blocks, setBlocks] = useState([]);

  const sensors = useSensors(useSensor(PointerSensor));

  // ⚡ Fetch curso y bloques
  useEffect(() => {
    const fetchData = async () => {
      const courseData = await getCourseById(id);
      setCourse(courseData);

      const data = await getCourseBlocks(id);
      setBlocks(data.blocks || []);
    };
    fetchData();
  }, [id]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      const newBlocks = arrayMove(blocks, oldIndex, newIndex);
      setBlocks(newBlocks);
      await saveCourseBlocks(id, newBlocks);
    }
  };

  const handleAddBlock = (type) => {
    const newBlock = {
      id: Date.now().toString(), // ID temporal
      type,
      content: "",
      url: "",
    };
    const updated = [...blocks, newBlock];
    setBlocks(updated);
    saveCourseBlocks(id, updated);
  };

  const handleBlockChange = (blockId, updatedBlock) => {
    const updated = blocks.map((b) => (b.id === blockId ? updatedBlock : b));
    setBlocks(updated);
    saveCourseBlocks(id, updated);
  };

  if (!course)
    return <p className="text-gray-500 text-center">Cargando curso...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow">
      <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
      <p className="text-gray-600 mb-6">{course.description}</p>

      {/* Botones para agregar bloques */}
      <div className="flex gap-2 mb-6">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          onClick={() => handleAddBlock("text")}
        >
          Agregar texto
        </button>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          onClick={() => handleAddBlock("image")}
        >
          Agregar imagen
        </button>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          onClick={() => handleAddBlock("video")}
        >
          Agregar video
        </button>
      </div>

      {blocks.length === 0 && (
        <p className="text-gray-500 text-center">
          Aquí se mostrará el contenido del curso 📘
        </p>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={blocks.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          {blocks.map((block) => (
            <SortableBlock
              key={block.id}
              block={block}
              onChange={handleBlockChange}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
