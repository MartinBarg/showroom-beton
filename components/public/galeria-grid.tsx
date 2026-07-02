"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export function GaleriaGrid({ imagenes, titulo }: { imagenes: string[]; titulo: string }) {
  const [indice, setIndice] = useState<number | null>(null);

  if (imagenes.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-white/20 text-stone-400">
        Todavía no hay imágenes cargadas para {titulo}.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {imagenes.map((url, i) => (
          <button
            key={url}
            type="button"
            onClick={() => setIndice(i)}
            className="group overflow-hidden rounded-lg border border-white/10"
          >
            <img
              src={url}
              alt={`${titulo} — imagen ${i + 1}`}
              className="aspect-[3/2] w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {indice !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/95 p-4">
          <button
            type="button"
            onClick={() => setIndice(null)}
            className="absolute right-4 top-4 rounded-md p-2 text-stone-300 hover:bg-white/10"
            aria-label="Cerrar"
          >
            <X className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={() => setIndice((indice + imagenes.length - 1) % imagenes.length)}
            className="absolute left-2 rounded-md p-2 text-stone-300 hover:bg-white/10 sm:left-6"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          <img
            src={imagenes[indice]}
            alt={`${titulo} — imagen ${indice + 1}`}
            className="max-h-[85vh] max-w-full rounded-lg object-contain"
          />
          <button
            type="button"
            onClick={() => setIndice((indice + 1) % imagenes.length)}
            className="absolute right-2 rounded-md p-2 text-stone-300 hover:bg-white/10 sm:right-6"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        </div>
      )}
    </>
  );
}
