// frontend/src/components/CourseEditor.jsx
import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import {
  postCourse,
  assignStudent,
  getMyCourses,
  getStudents,
  deleteCourse,
  getCourseById,
} from "../api";
import CourseBuilder from "./CourseBuilder";

export default function CourseEditor() {
  const { user } = useUser();
  const clerkId = user?.id;

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [message, setMessage] = useState("");

  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [editingCourse, setEditingCourse] = useState(null);
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);

  // 🔄 Cargar cursos
  const loadCourses = async () => {
    if (!clerkId) return;
    try {
      const data = await getMyCourses(clerkId);
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setMessage("❌ Error cargando cursos");
    }
  };

  useEffect(() => {
    loadCourses();
  }, [clerkId]);

  // 🔄 Cargar estudiantes
  const loadStudents = async () => {
    if (!clerkId) return;
    try {
      const data = await getStudents(clerkId);
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setMessage("❌ Error obteniendo estudiantes");
    }
  };

  useEffect(() => {
    loadStudents();
  }, [clerkId]);

  // ➕ Crear o actualizar curso
  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    if (!title || !desc) {
      setMessage("Completa todos los campos");
      return;
    }

    try {
      const payload = {
        title,
        description: desc,
        resources: resourceUrl ? [{ type: "link", url: resourceUrl }] : [],
      };

      await postCourse(
        editingCourse ? { ...payload, id: editingCourse.id } : payload,
        clerkId
      );

      setMessage(editingCourse ? "✅ Curso actualizado" : "✅ Curso creado");
      setEditingCourse(null);
      setTitle("");
      setDesc("");
      setResourceUrl("");
      await loadCourses();
    } catch (err) {
      console.error(err);
      setMessage("❌ Error al crear/actualizar el curso");
    }
  };

  // 🗑️ Eliminar curso
  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("¿Seguro que deseas borrar este curso?")) return;
    try {
      await deleteCourse(courseId, clerkId);
      setMessage("✅ Curso eliminado");
      await loadCourses();
    } catch (err) {
      console.error(err);
      setMessage("❌ Error al borrar el curso");
    }
  };

  // ✏️ Editar curso (abre el CourseBuilder)
  const handleEditCourse = async (course) => {
    try {
      const data = await getCourseById(course.id);
      setEditingCourse(data);
      setTitle(data.title);
      setDesc(data.description || "");
      setResourceUrl(data.resources?.[0]?.url || "");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Error cargando curso:", err);
    }
  };

  // 🎯 Asignar estudiantes
  const handleAssignStudents = async (courseId) => {
    if (selectedStudents.length === 0) {
      setMessage("Selecciona al menos un estudiante");
      return;
    }
    try {
      const res = await assignStudent(courseId, selectedStudents, clerkId);
      setMessage(
        res.success
          ? "✅ Estudiantes asignados correctamente"
          : "⚠️ Algunos estudiantes ya estaban asignados"
      );
      setSelectedStudents([]);
    } catch (err) {
      console.error(err);
      setMessage("❌ Error al asignar estudiantes");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-green-700 mb-4">
        Panel del Docente
      </h2>

      {/* CREAR / EDITAR */}
      <div className="bg-white p-4 rounded shadow mb-8">
        <h3 className="text-xl font-semibold mb-2">
          {editingCourse ? "Editar curso" : "Crear nuevo curso"}
        </h3>
        <form onSubmit={handleCreateOrUpdate} className="flex flex-col gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título del curso"
            className="border p-2 rounded"
          />
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Descripción del curso"
            className="border p-2 rounded"
          />
          <input
            value={resourceUrl}
            onChange={(e) => setResourceUrl(e.target.value)}
            placeholder="URL del recurso (opcional)"
            className="border p-2 rounded"
          />
          <button className="bg-green-700 text-white py-2 rounded hover:bg-green-800">
            {editingCourse ? "Actualizar curso" : "Crear curso"}
          </button>
        </form>
      </div>

      {/* CourseBuilder aparece cuando hay un curso en edición */}
      {editingCourse && (
        <div className="bg-white p-4 rounded shadow mb-8">
          <h3 className="text-lg font-semibold mb-3 text-green-700">
            ✏️ Constructor de contenido para: {editingCourse.title}
          </h3>
          <CourseBuilder courseId={editingCourse.id} />
        </div>
      )}

      {/* LISTADO DE CURSOS */}
      <div className="bg-white p-4 rounded shadow mb-8">
        <h3 className="text-xl font-semibold mb-3">Mis cursos creados</h3>
        {courses.length === 0 ? (
          <p>No has creado cursos todavía.</p>
        ) : (
          <ul className="space-y-4">
            {courses.map((c) => (
              <li
                key={c.id}
                className="border p-3 rounded shadow-sm bg-gray-50 flex flex-col gap-2"
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-lg text-gray-700">{c.title}</h4>
                  {c.creatorClerkId === clerkId && (
                    <div className="flex gap-2">
                      <button
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                        onClick={() => handleEditCourse(c)}
                      >
                        Editar
                      </button>
                      <button
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                        onClick={() => handleDeleteCourse(c.id)}
                      >
                        Borrar
                      </button>
                      <button
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        onClick={() =>
                          setExpandedCourseId(
                            expandedCourseId === c.id ? null : c.id
                          )
                        }
                      >
                        {expandedCourseId === c.id ? "Ocultar" : "Asignar"}
                      </button>
                    </div>
                  )}
                </div>

                {expandedCourseId === c.id && (
                  <div className="mt-3 border-t pt-3">
                    <p className="text-sm text-gray-700 mb-2">
                      Asignar estudiantes al curso: <strong>{c.title}</strong>
                    </p>
                    <select
                      multiple
                      className="border p-2 rounded w-full h-32"
                      value={selectedStudents}
                      onChange={(e) =>
                        setSelectedStudents(
                          Array.from(e.target.selectedOptions, (o) => o.value)
                        )
                      }
                    >
                      {students.map((s) => (
                        <option key={s.clerkId} value={s.clerkId}>
                          {s.firstName || s.email} {s.lastName || ""}
                        </option>
                      ))}
                    </select>
                    <button
                      className="bg-blue-700 text-white mt-3 px-4 py-2 rounded hover:bg-blue-800"
                      onClick={() => handleAssignStudents(c.id)}
                    >
                      Confirmar asignación
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {message && (
        <p className="mt-4 text-center text-green-700 font-medium">{message}</p>
      )}
    </div>
  );
}
