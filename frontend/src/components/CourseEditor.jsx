// src/components/CourseEditor.jsx
import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { postCourse, assignStudent, getMyCourses } from "../api";

export default function CourseEditor() {
  const { user } = useUser();
  const clerkId = user?.id;

  // Estados
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [message, setMessage] = useState("");

  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");

  // 🧩 Cargar cursos creados por el profesor
  useEffect(() => {
    if (!clerkId) return;
    (async () => {
      try {
        const data = await getMyCourses(clerkId);
        setCourses(data || []);
      } catch (err) {
        console.error("Error cargando cursos:", err);
      }
    })();
  }, [clerkId]);

  // 👥 Cargar lista de estudiantes desde backend
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("https://sag-backend-b2j6.onrender.com/api/auth/users");
        const allUsers = await res.json();
        const onlyStudents = allUsers.filter(u => u.role === "student");
        setStudents(onlyStudents);
      } catch (err) {
        console.error("Error obteniendo estudiantes:", err);
      }
    })();
  }, []);

  // ➕ Crear curso
  async function handleCreate(e) {
    e.preventDefault();
    if (!title || !desc) {
      setMessage("Por favor completa todos los campos");
      return;
    }
    setMessage("Creando curso...");
    try {
      const payload = { title, description: desc, resources: [{ type: "link", url: resourceUrl }] };
      const res = await postCourse(payload, clerkId);
      if (res.id) {
        setMessage("✅ Curso creado correctamente");
        setTitle("");
        setDesc("");
        setResourceUrl("");
        setCourses([...courses, res]);
      } else {
        setMessage("❌ Error al crear el curso");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Error en el servidor");
    }
  }

  // 🎯 Asignar estudiante
  async function handleAssign(e) {
    e.preventDefault();
    if (!selectedCourse || !selectedStudent) {
      setMessage("Selecciona un curso y un estudiante");
      return;
    }

    setMessage("Asignando estudiante...");
    try {
      const res = await assignStudent(selectedCourse, selectedStudent, clerkId);
      if (res.enroll || res.success) {
        setMessage("✅ Estudiante asignado correctamente");
      } else {
        setMessage("❌ Error al asignar estudiante");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Error en el servidor");
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-green-700 mb-4">Panel del Docente</h2>

      {/* === CREAR CURSO === */}
      <div className="bg-white p-4 rounded shadow mb-8">
        <h3 className="text-xl font-semibold mb-2">Crear nuevo curso</h3>
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título del curso"
            className="border p-2 rounded"
          />
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Descripción"
            className="border p-2 rounded"
          />
          <input
            value={resourceUrl}
            onChange={(e) => setResourceUrl(e.target.value)}
            placeholder="URL del recurso (YouTube, PDF...)"
            className="border p-2 rounded"
          />
          <button className="bg-green-700 text-white py-2 rounded hover:bg-green-800">
            Crear curso
          </button>
        </form>
      </div>

      {/* === ASIGNAR ESTUDIANTE === */}
      <div className="bg-white p-4 rounded shadow mb-8">
        <h3 className="text-xl font-semibold mb-3">Asignar estudiante a un curso</h3>
        <form onSubmit={handleAssign} className="flex flex-col md:flex-row gap-3">
          <select
            className="border p-2 rounded flex-1"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">Selecciona un curso</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>

          <select
            className="border p-2 rounded flex-1"
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
          >
            <option value="">Selecciona un estudiante</option>
            {students.map((s) => (
              <option key={s.clerkId || s.id} value={s.clerkId || s.id}>
                {s.name || s.email}
              </option>
            ))}
          </select>

          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Asignar
          </button>
        </form>
      </div>

      {message && <p className="mt-4 text-center text-green-700 font-medium">{message}</p>}
    </div>
  );
}
