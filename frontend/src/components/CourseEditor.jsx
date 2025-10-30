// src/components/CourseEditor.jsx
import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { postCourse, assignStudent } from "../api"; // ajustar path

export default function CourseEditor() {
  const { user } = useUser();
  const clerkId = user?.id;
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [studentClerkId, setStudentClerkId] = useState("");
  const [message, setMessage] = useState("");

  async function handleCreate(e) {
    e.preventDefault();
    setMessage("Creando...");
    const payload = { title, description: desc, resources: [{ type: "link", url: resourceUrl }] };
    const res = await postCourse(payload, clerkId);
    if (res.id) setMessage("Curso creado ✅");
    else setMessage("Error al crear");
  }

  async function handleAssign(e) {
    e.preventDefault();
    setMessage("Asignando...");
    const res = await assignStudent(/*courseId*/ 1, studentClerkId, clerkId); // aquí asumirás courseId real o UI para seleccionar
    if (res.enroll) setMessage("Estudiante asignado ✅");
    else setMessage("Error al asignar");
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-green-700">Crear curso</h2>
      <form onSubmit={handleCreate} className="flex flex-col gap-3 mt-4">
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Título" className="border p-2" />
        <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Descripción" className="border p-2" />
        <input value={resourceUrl} onChange={e=>setResourceUrl(e.target.value)} placeholder="YouTube / enlace recurso" className="border p-2" />
        <button className="bg-green-700 text-white py-2 rounded">Crear curso</button>
      </form>

      <hr className="my-4" />

      <h3 className="text-lg font-semibold">Asignar estudiante</h3>
      <form onSubmit={handleAssign} className="flex gap-2 mt-2">
        <input placeholder="student clerkId" value={studentClerkId} onChange={e=>setStudentClerkId(e.target.value)} className="border p-2" />
        <button className="bg-blue-600 text-white px-4 rounded">Asignar</button>
      </form>

      <p className="mt-4 text-red-500">{message}</p>
    </div>
  );
}
