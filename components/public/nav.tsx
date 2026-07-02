"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/proyecto", etiqueta: "Proyecto" },
  { href: "/catalogo", etiqueta: "Catálogo" },
  { href: "/local-comercial", etiqueta: "Local comercial" },
  { href: "/avances-de-obra", etiqueta: "Avances de obra" },
  { href: "/ubicacion", etiqueta: "Ubicación" },
  { href: "/contacto", etiqueta: "Contacto" },
];

export function PublicNav() {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-stone-950/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-display text-lg tracking-wide text-stone-100">
          Washington <span className="text-amber-400">2346</span>
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm text-stone-300 transition-colors hover:text-white",
                pathname.startsWith(link.href) && "text-amber-400"
              )}
            >
              {link.etiqueta}
            </Link>
          ))}
          <Link
            href="/admin/login"
            className="rounded-md border border-amber-400/60 px-4 py-1.5 text-sm text-amber-300 transition-colors hover:bg-amber-400 hover:text-stone-950"
          >
            Ingresar
          </Link>
        </div>

        <button
          type="button"
          className="rounded-md p-2 text-stone-200 lg:hidden"
          onClick={() => setAbierto((v) => !v)}
          aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
        >
          {abierto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {abierto && (
        <div className="border-t border-white/10 bg-stone-950/95 px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-3">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setAbierto(false)}
                className={cn(
                  "text-sm text-stone-300 hover:text-white",
                  pathname.startsWith(link.href) && "text-amber-400"
                )}
              >
                {link.etiqueta}
              </Link>
            ))}
            <Link
              href="/admin/login"
              onClick={() => setAbierto(false)}
              className="mt-1 w-fit rounded-md border border-amber-400/60 px-4 py-1.5 text-sm text-amber-300"
            >
              Ingresar
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
