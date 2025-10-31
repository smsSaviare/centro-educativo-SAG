// frontend/src/components/CourseEditor.jsx
import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import {
  postCourse,
  assignStudent,
  getMyCourses,
  getStudents,
  deleteCourse,
} from "../api";

export default function CourseEditor() {
  const { user } = useUser();
  const clerkId = user?.id;
  console.log(clerkId);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [message, setMessage] = useState("");

  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [editingCourseId, setEditingCourseId] = useState(null);

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

  useEffect(() => { loadCourses(); }, [clerkId]);

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

  useEffect(() => { loadStudents(); }, [clerkId]);

  // ➕ Crear/Actualizar curso
  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    if (!title || !desc) { setMessage("Completa todos los campos"); return; }

    setMessage(editingCourseId ? "Actualizando curso..." : "Creando curso...");
    try {
      const payload = { title, description: desc, resources: [{ type: "link", url: resourceUrl }] };
      const res = await postCourse(editingCourseId ? { ...payload, id: editingCourseId } : payload, clerkId);
      setMessage(editingCourseId ? "✅ Curso actualizado" : "✅ Curso creado");
      setEditingCourseId(null);
      setTitle(""); setDesc(""); setResourceUrl("");
      await loadCourses();
    } catch (err) {
      console.error(err);
      setMessage("❌ Error en el servidor");
    }
  };

  // 🎯 Asignar estudiantes
  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedCourse || selectedStudents.length === 0) { setMessage("Selecciona un curso y al menos un estudiante"); return; }

    setMessage("Asignando estudiantes...");
    try {
      const res = await assignStudent(selectedCourse, selectedStudents, clerkId);
      setMessage(res.success ? "✅ Estudiantes asignados correctamente" : "❌ Algunos estudiantes ya estaban asignados");
      setSelectedCourse(""); setSelectedStudents([]);
    } catch (err) {
      console.error(err);
      setMessage("❌ Error asignando estudiantes");
    }
  };

  // 🗑️ Borrar curso
  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("¿Seguro quieres borrar este curso?")) return;
    try {
      await deleteCourse(courseId, clerkId);
      setMessage("✅ Curso eliminado");
      await loadCourses();
    } catch (err) {
      console.error(err);
      setMessage("❌ Error al borrar el curso");
    }
  };

  // ✏️ Editar curso
  const handleEditCourse = (course) => {
    setEditingCourseId(course.id);
    setTitle(course.title);
    setDesc(course.description || "");
    setResourceUrl(course.resources?.[0]?.url || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-green-700 mb-4">Panel del Docente</h2>

      {/* CREAR/EDITAR */}
      <div className="bg-white p-4 rounded shadow mb-8">
        <h3 className="text-xl font-semibold mb-2">{editingCourseId ? "Editar curso" : "Crear nuevo curso"}</h3>
        <form onSubmit={handleCreateOrUpdate} className="flex flex-col gap-3">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título" className="border p-2 rounded" />
          <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Descripción" className="border p-2 rounded" />
          <input value={resourceUrl} onChange={e => setResourceUrl(e.target.value)} placeholder="URL del recurso" className="border p-2 rounded" />
          <button className="bg-green-700 text-white py-2 rounded hover:bg-green-800">{editingCourseId ? "Actualizar curso" : "Crear curso"}</button>
        </form>
      </div>

      {/* CURSOS */}
      <div className="bg-white p-4 rounded shadow mb-8">
        <h3 className="text-xl font-semibold mb-3">Mis cursos</h3>
        {courses.length === 0 ? <p>No has creado cursos todavía.</p> :
          <ul className="space-y-2">
            {courses.map(c => (
              <li key={c.id} className="flex justify-between items-center border p-2 rounded">
                <span>{c.title}</span>
                <div className="flex gap-2">
                  <button className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600" onClick={() => handleEditCourse(c)}>Editar</button>
                  <button className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700" onClick={() => handleDeleteCourse(c.id)}>Borrar</button>
                </div>
              </li>
            ))}
          </ul>
        }
      </div>

      {/* ASIGNAR ESTUDIANTES */}
      <div className="bg-white p-4 rounded shadow mb-8">
        <h3 className="text-xl font-semibold mb-3">Asignar estudiantes a un curso</h3>
        {courses.length === 0 ? (
          <p className="text-red-600">Crea primero un curso para asignar estudiantes.</p>
        ) : (
          <form onSubmit={handleAssign} className="flex flex-col md:flex-row gap-3">
            <select className="border p-2 rounded flex-1" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
              <option value="">Selecciona un curso</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>

            <select multiple className="border p-2 rounded flex-1" value={selectedStudents} onChange={e => setSelectedStudents(Array.from(e.target.selectedOptions, o => o.value))}>
              {students.map(s => <option key={s.clerkId} value={s.clerkId}>{s.firstName || s.email} {s.lastName || ""}</option>)}
            </select>

            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Asignar</button>
          </form>
        )}
      </div>

      {message && <p className="mt-4 text-center text-green-700 font-medium">{message}</p>}
    </div>
  );
}
