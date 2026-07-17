"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Home,
  Building2,
  LayoutGrid,
  Store,
  HardHat,
  MapPin,
  Mail,
  LogIn,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ItemMenu = {
  href: string;
  etiqueta: string;
  icono: LucideIcon;
  exacto?: boolean;
};

// Páginas del showroom, cada una con un ícono que representa la sección.
const PAGINAS: ItemMenu[] = [
  { href: "/", etiqueta: "Inicio", icono: Home, exacto: true },
  { href: "/proyecto", etiqueta: "Proyecto", icono: Building2 },
  { href: "/catalogo", etiqueta: "Catálogo", icono: LayoutGrid },
  { href: "/local-comercial", etiqueta: "Local comercial", icono: Store },
  { href: "/avances-de-obra", etiqueta: "Avances de obra", icono: HardHat },
  { href: "/ubicacion", etiqueta: "Ubicación", icono: MapPin },
  { href: "/contacto", etiqueta: "Contacto", icono: Mail },
];

function esActiva(pathname: string, item: ItemMenu) {
  return item.exacto ? pathname === item.href : pathname.startsWith(item.href);
}

// Botón flotante persistente que se mantiene en la misma posición entre
// pantallas para dar la sensación de app. Al tocarlo despliega un panel con
// todas las páginas disponibles y su ícono.
export function AppMenu() {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);

  // Cerrar con Escape.
  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [abierto]);

  return (
    <>
      {/* Botón flotante — posición fija idéntica en todas las pantallas */}
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={abierto}
        className={cn(
          "fixed left-4 top-4 z-[60] flex h-12 w-12 items-center justify-center rounded-full",
          "border border-white/10 bg-stone-950/70 text-stone-100 shadow-lg backdrop-blur",
          "transition-colors hover:bg-stone-900/80 sm:left-6 sm:top-6"
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={abierto ? "x" : "menu"}
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.15 }}
          >
            {abierto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </motion.span>
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {abierto && (
          <>
            {/* Backdrop para cerrar tocando afuera */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setAbierto(false)}
              className="fixed inset-0 z-50 bg-stone-950/40 backdrop-blur-[2px]"
            />

            {/* Panel con las páginas */}
            <motion.nav
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={cn(
                "fixed left-4 top-4 z-[60] w-[calc(100%-2rem)] max-w-xs overflow-hidden rounded-2xl",
                "border border-white/10 bg-stone-900/95 shadow-2xl backdrop-blur sm:left-6 sm:top-6"
              )}
            >
              <div className="flex items-start justify-between gap-3 px-5 pb-4 pt-5">
                <div className="min-w-0">
                  <p className="font-display text-lg leading-tight text-stone-100">
                    Washington <span className="text-amber-400">2346</span>
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-stone-400">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    Belgrano · Ciudad de Buenos Aires
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAbierto(false)}
                  aria-label="Cerrar menú"
                  className="-mr-1 shrink-0 rounded-full p-1.5 text-stone-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="h-px bg-white/10" />

              <ul className="flex flex-col p-2">
                {PAGINAS.map((item) => {
                  const activa = esActiva(pathname, item);
                  const Icono = item.icono;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setAbierto(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                          activa
                            ? "bg-amber-400/10 text-amber-300"
                            : "text-stone-300 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <Icono className="h-5 w-5 shrink-0" />
                        <span>{item.etiqueta}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="h-px bg-white/10" />

              <div className="p-2">
                <Link
                  href="/admin/login"
                  onClick={() => setAbierto(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-stone-300 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <LogIn className="h-5 w-5 shrink-0" />
                  <span>Ingresar</span>
                </Link>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
