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

function SortableBlock({ block, index }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginBottom: "1.5rem",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {block.type === "text" && (
        <p className="text-lg leading-relaxed whitespace-pre-wrap">
          {block.content || "(Bloque vacío)"}
        </p>
      )}
      {block.type === "image" && block.url && (
        <img
          src={block.url}
          alt="Contenido del curso"
          className="rounded-2xl shadow-md max-h-[400px]"
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
          className="rounded-2xl shadow-md"
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

      // Guardar orden en backend
      await saveCourseBlocks(id, newBlocks);
    }
  };

  if (!course)
    return <p className="text-gray-500 text-center">Cargando curso...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow">
      <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
      <p className="text-gray-600 mb-6">{course.description}</p>

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
          {blocks.map((block, index) => (
            <SortableBlock key={block.id} block={block} index={index} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
