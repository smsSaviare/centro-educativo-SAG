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
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useClerk();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinkClass =
    "block px-4 py-2 hover:text-green-600 transition font-semibold";

  const handleLogout = async () => {
    try {
      await signOut({
        redirectUrl: "https://smssaviare.github.io/centro-educativo-SAG/#/",
      });
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      console.error("Error cerrando sesión:", err);
      window.location.href =
        "https://smssaviare.github.io/centro-educativo-SAG/#/";
    }
  };

  const NavLinks = () => (
    <>
      <div className={navLinkClass} onClick={() => navigate("/")}>
        Inicio
      </div>
      <div className={navLinkClass} onClick={() => navigate("/courses")}>
        Cursos
      </div>
      <div className={navLinkClass} onClick={() => navigate("/dashboard")}>
        Panel
      </div>
      <div
        onClick={() => (window.location.hash = "#contacto")}
        className={`${navLinkClass} bg-green-700 text-white rounded-full hover:bg-green-600 text-center`}
      >
        Contacto
      </div>
    </>
  );

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
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="text-2xl font-bold text-green-700 cursor-pointer"
        >
          ✈️ Saviare
        </div>

        {/* Botón menú móvil */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-green-700 hover:text-green-500 transition"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Enlaces en escritorio */}
        <div className="hidden md:flex items-center space-x-6 text-green-800">
          <NavLinks />

          <SignedOut>
            <div className="flex items-center space-x-3">
              <SignInButton mode="modal">
                <button className="bg-green-700 text-white px-4 py-2 rounded-full hover:bg-green-600 transition">
                  Acceder
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-500 transition">
                  Registrarse
                </button>
              </SignUpButton>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center gap-3">
              <UserButton />
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition"
              >
                Cerrar sesión
              </button>
            </div>
          </SignedIn>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-lg border-t border-green-100 text-green-800 px-6 py-4 space-y-3">
          <NavLinks />
          <SignedOut>
            <SignInButton mode="modal">
              <button className="w-full bg-green-700 text-white py-2 rounded-full hover:bg-green-600">
                Acceder
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="w-full bg-blue-600 text-white py-2 rounded-full hover:bg-blue-500 mt-2">
                Registrarse
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <div className="flex flex-col gap-3">
              <UserButton />
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white py-2 rounded-full hover:bg-red-600"
              >
                Cerrar sesión
              </button>
            </div>
          </SignedIn>
        </div>
      )}
    </motion.nav>
  );
}
