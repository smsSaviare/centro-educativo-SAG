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
        setBlocks(data.blocks || []);
      } catch (err) {
        console.error("❌ Error cargando curso:", err);
      }
    };
    fetchData();
  }, [id]);

  if (!course)
    return (
      <p className="text-gray-500 text-center">Cargando curso...</p>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow">
      <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
      <p className="text-gray-600 mb-6">{course.description}</p>

      {blocks.length === 0 ? (
        <p className="text-gray-500 text-center">
          Aquí se mostrará el contenido del curso 📘
        </p>
      ) : (
        blocks.map((b, i) => {
          // 🔧 Asegurarse de que el contenido sea un objeto parseado
          const content =
            typeof b.content === "string"
              ? (() => {
                  try {
                    return JSON.parse(b.content);
                  } catch {
                    return { content: b.content };
                  }
                })()
              : b.content;

          // 🔹 Renderizado seguro según el tipo
          if (b.type === "text") {
            return (
              <div key={i} className="my-6">
                <p className="text-lg leading-relaxed whitespace-pre-wrap">
                  {content?.content || ""}
                </p>
              </div>
            );
          }

          if (b.type === "image") {
            return (
              <div key={i} className="my-6">
                <img
                  src={content?.url || b.url}
                  alt="Contenido del curso"
                  className="rounded-2xl shadow-md mx-auto"
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

          return null;
        })
      )}
    </div>
  );
}
