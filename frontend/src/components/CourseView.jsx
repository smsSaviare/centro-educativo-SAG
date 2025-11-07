// frontend/src/components/CourseView.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCourseById, getCourseBlocks } from "../api";

export default function CourseView() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [blocks, setBlocks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseData = await getCourseById(id);
        setCourse(courseData);

        const data = await getCourseBlocks(id);
        console.log("🧩 Bloques recibidos desde backend:", data);
        setBlocks(data.blocks || []);
      } catch (err) {
        console.error("❌ Error cargando curso:", err);
      }
    };
    fetchData();
  }, [id]);

  if (!course)
    return <p className="text-gray-500 text-center">Cargando curso...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow">
      <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
      <p className="text-gray-600 mb-6">{course.description}</p>

      {(!blocks || blocks.length === 0) && (
        <p className="text-gray-500 text-center">
          Aquí se mostrará el contenido del curso 📘
        </p>
      )}

      {blocks.map((b, i) => {
        // 🧠 Asegurar que el contenido esté bien formateado
        let content = b.content;
        if (typeof content === "string") {
          try {
            content = JSON.parse(content);
          } catch {
            content = { content };
          }
        }

        // 🔍 Log de cada bloque
        console.log(`📦 Bloque ${i + 1}:`, { type: b.type, content });

        if (!b.type) {
          return (
            <p key={i} className="text-red-500">
              ⚠️ Bloque sin tipo definido (ver consola)
            </p>
          );
        }

        if (b.type === "text") {
          return (
            <div key={i} className="my-6">
              <p className="text-lg leading-relaxed whitespace-pre-wrap">
                {content?.content || "(Bloque vacío)"}
              </p>
            </div>
          );
        }

        if (b.type === "image") {
          return (
            <div key={i} className="my-6 flex justify-center">
              <img
                src={content?.url || b.url}
                alt="Contenido del curso"
                className="rounded-2xl shadow-md max-h-[400px]"
              />
            </div>
          );
        }

        if (b.type === "link" && content?.url?.includes("youtube")) {
          const embedUrl = content.url.replace("watch?v=", "embed/");
          return (
            <div key={i} className="my-6 flex justify-center">
              <iframe
                width="560"
                height="315"
                src={embedUrl}
                title="Video del curso"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-2xl shadow-md"
              ></iframe>
            </div>
          );
        }

        return (
          <p key={i} className="text-gray-400 italic">
            Tipo de bloque no soportado o vacío 🧱
          </p>
        );
      })}
    </div>
  );
}