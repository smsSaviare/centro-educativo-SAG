// src/components/Footer.jsx
import { motion } from "framer-motion";
import { Mail, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="bg-green-800 text-white py-10 mt-20"
    >
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
        {/* 🛫 Marca */}
        <div>
          <h2 className="text-2xl font-bold mb-3">✈️ Saviare</h2>
          <p className="text-green-100 leading-relaxed">
            Plataforma educativa de Saviare, una empresa dedicada a la formación
            y desarrollo en el ámbito de la aviación moderna.
          </p>
        </div>

        {/* 🔗 Enlaces rápidos */}
        <div>
          <h3 className="text-lg font-semibold mb-3 border-b border-green-500 pb-2 inline-block">
            Enlaces rápidos
          </h3>
          <ul className="space-y-2 text-green-100">
            <li>
              <a href="#/" className="hover:text-white transition">
                Inicio
              </a>
            </li>
            <li>
              <a href="#/courses" className="hover:text-white transition">
                Cursos
              </a>
            </li>
            <li>
              <a href="#/dashboard" className="hover:text-white transition">
                Panel docente
              </a>
            </li>
            <li>
              <a href="#/contacto" className="hover:text-white transition">
                Contacto
              </a>
            </li>
          </ul>
        </div>

        {/* 📩 Contacto */}
        <div>
          <h3 className="text-lg font-semibold mb-3 border-b border-green-500 pb-2 inline-block">
            Contáctanos
          </h3>
          <div className="flex items-center gap-2 text-green-100">
            <Mail size={18} />
            <a
              href="mailto:info@saviare.com"
              className="hover:text-white transition"
            >
              info@saviare.com
            </a>
          </div>

          {/* 🌐 Redes sociales */}
          <div className="flex gap-4 mt-4">
            <a
              href="https://www.facebook.com/saviare"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition"
            >
              <Facebook size={22} />
            </a>
            <a
              href="https://www.instagram.com/saviare"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-pink-400 transition"
            >
              <Instagram size={22} />
            </a>
            <a
              href="https://www.linkedin.com/company/saviare"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-300 transition"
            >
              <Linkedin size={22} />
            </a>
            <a
              href="https://www.youtube.com/@saviare"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-red-400 transition"
            >
              <Youtube size={22} />
            </a>
          </div>
        </div>
      </div>

      {/* ⚙️ Créditos inferiores */}
      <div className="mt-10 border-t border-green-700 pt-4 text-center text-green-200 text-sm">
        © {new Date().getFullYear()} Saviare. Todos los derechos reservados.
      </div>
    </motion.footer>
  );
}
