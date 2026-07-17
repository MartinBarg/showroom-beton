"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Lock, X } from "lucide-react";
import { cn, formatearSuperficie } from "@/lib/utils";

type Overlay = { unidadId: string; svgPath: string };

type Vista = {
  id: string;
  nombre: string;
  imagenUrl: string;
  esVistaInicial: boolean;
  overlays: Overlay[];
};

type Transicion = {
  vistaOrigenId: string;
  vistaDestinoId: string;
  videoUrl: string | null;
};

type Unidad = {
  id: string;
  numero: string;
  tipologia: string;
  superficieTotal: number;
  estado: string;
  esLocalComercial: boolean;
};

type Props = {
  vistas: Vista[];
  transiciones: Transicion[];
  unidades: Unidad[];
};

const COLORES: Record<string, { fill: string; stroke: string }> = {
  disponible: { fill: "rgba(52, 211, 153, 0.25)", stroke: "rgba(52, 211, 153, 0.9)" },
  reservada: { fill: "rgba(251, 191, 36, 0.35)", stroke: "rgba(251, 191, 36, 0.9)" },
  vendida: { fill: "rgba(244, 63, 94, 0.35)", stroke: "rgba(244, 63, 94, 0.9)" },
};

export function FachadaInteractiva({ vistas, transiciones, unidades }: Props) {
  const inicial = vistas.find((v) => v.esVistaInicial) ?? vistas[0];
  const [vistaActual, setVistaActual] = useState<Vista | undefined>(inicial);
  const [videoActivo, setVideoActivo] = useState<string | null>(null);
  const vistaPendiente = useRef<Vista | null>(null);
  const [resaltada, setResaltada] = useState<string | null>(null);
  const [preview, setPreview] = useState<Unidad | null>(null);
  // Tamaño natural de la foto actual: el viewBox del SVG de overlays tiene
  // que calzar con los píxeles reales de la imagen (mismo "contain" que el <img>)
  // para que los polígonos queden pegados a los departamentos.
  const [naturalSize, setNaturalSize] = useState({ w: 1600, h: 1000 });
  const imgRef = useRef<HTMLImageElement>(null);

  const porId = useMemo(() => new Map(unidades.map((u) => [u.id, u])), [unidades]);

  // Si la imagen ya está en caché del navegador, "onLoad" nunca se dispara
  // porque el evento nativo ya pasó antes de montar el listener de React.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth) {
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
    }
  }, [vistaActual?.id]);

  if (!vistaActual) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-stone-400">
        Todavía no hay vistas exteriores cargadas.
      </div>
    );
  }

  function cambiarVista(destino: Vista) {
    if (!vistaActual || destino.id === vistaActual.id || videoActivo) return;
    setPreview(null);
    setResaltada(null);

    const transicion = transiciones.find(
      (t) => t.vistaOrigenId === vistaActual.id && t.vistaDestinoId === destino.id
    );
    if (transicion?.videoUrl) {
      // Video de transición pregrabado; al terminar se muestra la vista nueva
      vistaPendiente.current = destino;
      setVideoActivo(transicion.videoUrl);
    } else {
      // Fallback: crossfade CSS (documentado en NOTAS-PARA-REVISION.md)
      setVistaActual(destino);
    }
  }

  function terminarVideo() {
    if (vistaPendiente.current) {
      setVistaActual(vistaPendiente.current);
      vistaPendiente.current = null;
    }
    setVideoActivo(null);
  }

  function manejarPointerUp(e: React.PointerEvent, unidad: Unidad) {
    // Desktop: el hover ya resaltó la sección; el click/tap abre la ficha.
    // Mobile: no hay hover, así que el tap resalta y abre la ficha a la vez.
    e.stopPropagation();
    setResaltada(unidad.id);
    setPreview(unidad);
  }

  const fichaHref = (u: Unidad) =>
    u.esLocalComercial ? "/local-comercial" : `/proyecto/unidad/${u.id}`;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-stone-900">
      {/* Imagen estática de la vista actual, con crossfade entre vistas */}
      <AnimatePresence>
        <motion.img
          key={vistaActual.id}
          ref={imgRef}
          src={vistaActual.imagenUrl}
          alt={vistaActual.nombre}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0 h-full w-full bg-white object-contain"
          onLoad={(e) => {
            const img = e.currentTarget;
            setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
          }}
        />
      </AnimatePresence>

      {/* Overlay SVG con las áreas clickeables */}
      {!videoActivo && (
        <svg
          viewBox={`0 0 ${naturalSize.w} ${naturalSize.h}`}
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 h-full w-full"
          onPointerUp={() => {
            setResaltada(null);
            setPreview(null);
          }}
        >
          {vistaActual.overlays.map((overlay) => {
            const unidad = porId.get(overlay.unidadId);
            if (!unidad) return null;
            const color = COLORES[unidad.estado] ?? COLORES.disponible;
            const activa = resaltada === unidad.id || preview?.id === unidad.id;
            return (
              <path
                key={`${vistaActual.id}-${overlay.unidadId}`}
                d={overlay.svgPath}
                fill={color.fill}
                stroke={color.stroke}
                strokeWidth={activa ? 5 : 2}
                className={cn(
                  "cursor-pointer transition-opacity duration-150",
                  activa ? "opacity-100" : "opacity-0"
                )}
                style={activa ? { filter: "brightness(1.35)" } : undefined}
                onMouseEnter={() => setResaltada(unidad.id)}
                onMouseLeave={() => setResaltada((r) => (r === unidad.id ? null : r))}
                onPointerUp={(e) => manejarPointerUp(e, unidad)}
              />
            );
          })}
        </svg>
      )}

      {/* Video de transición entre vistas */}
      {videoActivo && (
        <video
          src={videoActivo}
          autoPlay
          muted
          playsInline
          onEnded={terminarVideo}
          onError={terminarVideo}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* Botones para cambiar de vista */}
      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2 rounded-full bg-stone-950/70 p-1.5 backdrop-blur">
        {vistas.map((vista) => (
          <button
            key={vista.id}
            type="button"
            onClick={() => cambiarVista(vista)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm transition-colors",
              vista.id === vistaActual.id
                ? "bg-amber-400 text-stone-950"
                : "text-stone-300 hover:bg-white/10"
            )}
          >
            {vista.nombre}
          </button>
        ))}
      </div>

      {/* Preview flotante de la unidad */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-24 left-1/2 z-20 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-lg border border-white/10 bg-stone-950/90 p-5 text-stone-100 shadow-2xl backdrop-blur sm:bottom-auto sm:left-auto sm:right-6 sm:top-6 sm:translate-x-0"
          >
            <button
              type="button"
              onClick={() => {
                setPreview(null);
                setResaltada(null);
              }}
              className="absolute right-3 top-3 rounded-md p-1 text-stone-400 hover:bg-white/10 hover:text-white"
              aria-label="Cerrar preview"
            >
              <X className="h-4 w-4" />
            </button>
            <p className="text-xs uppercase tracking-widest text-amber-400">
              {preview.esLocalComercial ? "Local comercial" : "Unidad"}
            </p>
            <h3 className="mt-1 font-display text-3xl">{preview.numero}</h3>
            <dl className="mt-3 space-y-1 text-sm text-stone-300">
              <div className="flex justify-between">
                <dt>Tipología</dt>
                <dd className="capitalize">{preview.tipologia}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Superficie</dt>
                <dd>{formatearSuperficie(preview.superficieTotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Estado</dt>
                <dd className="flex items-center gap-1.5 capitalize">
                  {preview.estado === "vendida" && <Lock className="h-3.5 w-3.5 text-rose-400" />}
                  {preview.estado === "reservada" && (
                    <Clock className="h-3.5 w-3.5 text-amber-400" />
                  )}
                  {preview.estado}
                </dd>
              </div>
            </dl>
            <Link
              href={fichaHref(preview)}
              className="mt-4 block rounded-md bg-amber-400 px-4 py-2 text-center text-sm font-medium text-stone-950 transition-colors hover:bg-amber-300"
            >
              Ver unidad
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
