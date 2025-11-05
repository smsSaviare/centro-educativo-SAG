// frontend/src/components/CourseBuilder.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";

export default function CourseBuilder() {
  const { id } = useParams(); // courseId
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Cargar bloques del curso
  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const res = await axios.get(`/api/courses/${id}/blocks`);
        setBlocks(res.data || []);
      } catch (err) {
        console.error("❌ Error cargando bloques:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlocks();
  }, [id]);

  // Guardar bloques
  const saveBlocks = async () => {
    setSaving(true);
    try {
      await axios.post(`/api/courses/${id}/blocks`, { blocks });
      alert("✅ Contenido guardado correctamente");
    } catch (err) {
      console.error("❌ Error guardando bloques:", err);
      alert("Error al guardar contenido");
    } finally {
      setSaving(false);
    }
  };

  // Agregar nuevo bloque
  const addBlock = (type) => {
    const newBlock = { id: Date.now(), type, content: "", extra: {} };
    setBlocks([...blocks, newBlock]);
  };

  // Actualizar bloque
  const updateBlock = (id, field, value) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  // Eliminar bloque
  const removeBlock = (id) => {
    if (window.confirm("¿Eliminar este bloque?")) {
      setBlocks(blocks.filter((b) => b.id !== id));
    }
  };

  // Reordenar bloques
  const moveBlock = (index, direction) => {
    const newBlocks = [...blocks];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;
    [newBlocks[index], newBlocks[targetIndex]] = [
      newBlocks[targetIndex],
      newBlocks[index],
    ];
    setBlocks(newBlocks);
  };

  if (loading) return <p>Cargando contenido...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">
        ✏️ Constructor del curso
      </h1>

      {/* Botones de agregar */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button onClick={() => addBlock("text")}>📝 Texto</Button>
        <Button onClick={() => addBlock("image")}>🖼️ Imagen</Button>
        <Button onClick={() => addBlock("video")}>🎬 Video YouTube</Button>
      </div>

      {/* Lista de bloques */}
      <div className="space-y-4">
        {blocks.map((block, index) => (
          <motion.div
            key={block.id}
            layout
            className="bg-white shadow-md p-4 rounded-2xl border"
          >
            <div className="flex justify-between items-center mb-2">
              <strong>
                {index + 1}. {block.type.toUpperCase()}
              </strong>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => moveBlock(index, "up")}
                >
                  ↑
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => moveBlock(index, "down")}
                >
                  ↓
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeBlock(block.id)}
                >
                  🗑️
                </Button>
              </div>
            </div>

            {/* Edición según tipo */}
            {block.type === "text" && (
              <Textarea
                placeholder="Escribe tu contenido aquí..."
                value={block.content}
                onChange={(e) => updateBlock(block.id, "content", e.target.value)}
              />
            )}

            {block.type === "image" && (
              <div>
                <Input
                  placeholder="URL de la imagen..."
                  value={block.content}
                  onChange={(e) => updateBlock(block.id, "content", e.target.value)}
                />
                {block.content && (
                  <img
                    src={block.content}
                    alt="Vista previa"
                    className="mt-3 max-h-60 rounded-xl border"
                  />
                )}
              </div>
            )}

            {block.type === "video" && (
              <div>
                <Input
                  placeholder="Enlace de YouTube..."
                  value={block.content}
                  onChange={(e) => updateBlock(block.id, "content", e.target.value)}
                />
                {block.content && (
                  <iframe
                    src={`https://www.youtube.com/embed/${
                      block.content.split("v=")[1]
                    }`}
                    title="Video"
                    className="mt-3 w-full aspect-video rounded-xl"
                    allowFullScreen
                  />
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center">
        <Button onClick={saveBlocks} disabled={saving}>
          {saving ? "💾 Guardando..." : "💾 Guardar cambios"}
        </Button>
      </div>
    </div>
  );
}
