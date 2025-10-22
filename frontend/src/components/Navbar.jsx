// src/components/Navbar.jsx
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinkClass =
    "hover:text-green-600 transition cursor-pointer font-semibold";

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8 }}
      className={`fixed top-0 left-0 w-full z-50 backdrop-blur-md transition-all duration-500 ${
        scrolled
          ? "bg-white/90 shadow-md"
          : "bg-white/70 shadow-sm border-b border-green-100"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo / Marca */}
        <div
          onClick={() => navigate("/")}
          className="text-2xl font-bold text-green-700 cursor-pointer"
        >
          ✈️ Saviare
        </div>

        {/* Enlaces */}
        <div className="flex space-x-6 text-green-800">
          <div className={navLinkClass} onClick={() => navigate("/")}>
            Inicio
          </div>
          <div className={navLinkClass} onClick={() => navigate("/courses")}>
            Cursos
          </div>
          <div className={navLinkClass} onClick={() => navigate("/dashboard")}>
            Panel
          </div>
          <div className={navLinkClass} onClick={() => navigate("/login")}>
            Acceder
          </div>
          <div
            onClick={() => navigate("#contacto")}
            className="bg-green-700 text-white px-4 py-2 rounded-full hover:bg-green-600 transition cursor-pointer"
          >
            Contacto
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
