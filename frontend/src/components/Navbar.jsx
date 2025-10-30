// src/components/Navbar.jsx
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useClerk,
} from "@clerk/clerk-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useClerk();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinkClass =
    "hover:text-green-600 transition cursor-pointer font-semibold";

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Error cerrando sesión:", err);
    } finally {
      // ✅ Redirige correctamente al inicio (sin perder el #)
      window.location.hash = "/";
    }
  };

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
        <div className="flex space-x-6 text-green-800 items-center">
          <div className={navLinkClass} onClick={() => navigate("/")}>
            Inicio
          </div>
          <div className={navLinkClass} onClick={() => navigate("/courses")}>
            Cursos
          </div>
          <div className={navLinkClass} onClick={() => navigate("/dashboard")}>
            Panel
          </div>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-green-700 text-white px-4 py-2 rounded-full hover:bg-green-600 transition cursor-pointer">
                Acceder
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-500 transition cursor-pointer">
                Registrarse
              </button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center gap-3">
              <UserButton />
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition cursor-pointer"
              >
                Cerrar sesión
              </button>
            </div>
          </SignedIn>

          <div
            onClick={() => (window.location.hash = "#contacto")}
            className="bg-green-700 text-white px-4 py-2 rounded-full hover:bg-green-600 transition cursor-pointer"
          >
            Contacto
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
