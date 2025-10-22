// src/components/Home.jsx
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import avionFondo from "../assets/avion.jpg";
import avionAnimado from "../assets/avion.png";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Fondo */}
      <img
        src={avionFondo}
        alt="Fondo Saviare"
        className="absolute inset-0 w-full h-full object-cover brightness-75"
      />

      {/* Cuadro principal centrado */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="absolute z-10 bg-white/85 backdrop-blur-md rounded-3xl shadow-xl px-12 py-10 max-w-2xl text-center left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <h1 className="text-5xl font-extrabold text-green-700 drop-shadow">
          Centro Educativo SAG
        </h1>
        <p className="mt-4 text-gray-700 text-lg leading-relaxed">
          Formación práctica en tecnología, control y aviación 🚀
        </p>

        {/* Botones centrados usando useNavigate */}
        <div className="mt-8 flex justify-center gap-6 flex-wrap">
          <button
            onClick={() => navigate("/login")}
            className="bg-green-700 text-white font-semibold px-6 py-3 rounded-full shadow-md hover:bg-green-600 transition-all"
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => navigate("/register")}
            className="bg-white text-green-700 border border-green-700 font-semibold px-6 py-3 rounded-full shadow-md hover:bg-green-50 transition-all"
          >
            Registrarse
          </button>
        </div>
      </motion.div>

      {/* Avión animado solo en movimiento horizontal */}
      <motion.img
        src={avionAnimado}
        alt="Avión Saviare"
        className="absolute w-28 bottom-16 opacity-90"
        initial={{ x: "-10%" }}
        animate={{ x: ["-10%", "110%"] }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: "loop",
          ease: "linear",
        }}
      />
    </div>
  );
}
