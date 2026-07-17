"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type HeroLandingProps = {
  nombre: string;
  tagline: string;
  imagenUrl: string;
};

export function HeroLanding({ nombre, tagline, imagenUrl }: HeroLandingProps) {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Fondo full-screen placeholder — reemplazar por render/video real */}
      <img
        src={imagenUrl}
        alt=""
        className="absolute inset-0 h-full w-full bg-white object-contain"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-stone-950/70 via-stone-950/50 to-stone-950" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center px-4 text-center"
      >
        <h1 className="font-display text-5xl leading-tight text-white sm:text-7xl">
          {nombre}
        </h1>
        <p className="mt-5 max-w-xl text-lg text-stone-300">{tagline}</p>
        <div className="mt-10">
          <Link
            href="/proyecto"
            className="rounded-md bg-amber-400 px-8 py-3 text-base font-medium text-stone-950 transition-colors hover:bg-amber-300"
          >
            Ver proyecto
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
