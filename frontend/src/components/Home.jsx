// frontend/src/components/Home.jsx
import { motion } from "framer-motion";
import avionFondo from "../assets/avion.jpg";
import avionAnimado from "../assets/avion.png";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/clerk-react";

export default function Home() {
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
        className="absolute z-10 bg-white/90 backdrop-blur-md rounded-3xl shadow-xl
                   px-6 py-8 sm:px-10 sm:py-10 md:px-12 md:py-12
                   max-w-[90%] sm:max-w-lg md:max-w-2xl
                   text-center left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-green-700 drop-shadow">
          Centro Educativo SAG
        </h1>
        <p className="mt-4 text-gray-700 text-base sm:text-lg md:text-xl leading-relaxed">
          Formación práctica en tecnología, control y aviación 🚀
        </p>

        {/* 🔹 Botones Clerk */}
        <div className="mt-8 flex justify-center gap-4 sm:gap-6 flex-wrap">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-green-700 text-white font-semibold px-5 py-3 rounded-full shadow-md hover:bg-green-600 transition-all text-sm sm:text-base">
                Iniciar sesión
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="bg-white text-green-700 border border-green-700 font-semibold px-5 py-3 rounded-full shadow-md hover:bg-green-50 transition-all text-sm sm:text-base">
                Registrarse
              </button>
            </SignUpButton>
          </SignedOut>

          {/* 🔹 Si el usuario ya está autenticado */}
          <SignedIn>
            <div className="flex flex-col items-center gap-3">
              <p className="text-green-700 font-semibold text-base sm:text-lg">
                ¡Bienvenido de nuevo!
              </p>
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
        </div>
      </motion.div>

      {/* Avión animado */}
      <motion.img
        src={avionAnimado}
        alt="Avión Saviare"
        className="absolute w-20 sm:w-24 md:w-28 bottom-10 sm:bottom-16 opacity-90"
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
