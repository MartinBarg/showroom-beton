"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { formatearPrecio, formatearSuperficie } from "@/lib/utils";

type UnidadCatalogo = {
  id: string;
  numero: string;
  tipologia: string;
  superficieTotal: number;
  orientacion: string;
  estado: string;
  precio: number;
  pisoNumero: number;
  renderUrl: string | null;
  esLocalComercial: boolean;
  destacada: boolean;
};

const ESTADO_ESTILO: Record<string, string> = {
  disponible: "bg-emerald-400/15 text-emerald-300",
  reservada: "bg-amber-400/15 text-amber-300",
  vendida: "bg-rose-500/15 text-rose-300",
};

const ORDENES = [
  { valor: "precio-asc", etiqueta: "Precio ↑" },
  { valor: "precio-desc", etiqueta: "Precio ↓" },
  { valor: "superficie-asc", etiqueta: "Superficie ↑" },
  { valor: "superficie-desc", etiqueta: "Superficie ↓" },
  { valor: "piso-asc", etiqueta: "Piso ↑" },
  { valor: "piso-desc", etiqueta: "Piso ↓" },
];

const selectClase =
  "h-10 rounded-md border border-white/15 bg-stone-900 px-3 text-sm text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400/60";

export function CatalogoClient({ unidades }: { unidades: UnidadCatalogo[] }) {
  const [tipologia, setTipologia] = useState("todas");
  const [orientacion, setOrientacion] = useState("todas");
  const [estado, setEstado] = useState("todos");
  const [piso, setPiso] = useState("todos");
  const [supMin, setSupMin] = useState("");
  const [supMax, setSupMax] = useState("");
  const [orden, setOrden] = useState("piso-asc");

  const tipologias = useMemo(
    () => [...new Set(unidades.map((u) => u.tipologia))].sort(),
    [unidades]
  );
  const orientaciones = useMemo(
    () => [...new Set(unidades.map((u) => u.orientacion))].sort(),
    [unidades]
  );
  const pisos = useMemo(
    () => [...new Set(unidades.map((u) => u.pisoNumero))].sort((a, b) => a - b),
    [unidades]
  );

  const filtradas = useMemo(() => {
    let resultado = unidades.filter((u) => {
      if (tipologia !== "todas" && u.tipologia !== tipologia) return false;
      if (orientacion !== "todas" && u.orientacion !== orientacion) return false;
      if (estado !== "todos" && u.estado !== estado) return false;
      if (piso !== "todos" && u.pisoNumero !== Number(piso)) return false;
      if (supMin && u.superficieTotal < Number(supMin)) return false;
      if (supMax && u.superficieTotal > Number(supMax)) return false;
      return true;
    });

    const [campo, direccion] = orden.split("-");
    const factor = direccion === "desc" ? -1 : 1;
    resultado = [...resultado].sort((a, b) => {
      if (campo === "precio") return (a.precio - b.precio) * factor;
      if (campo === "superficie") return (a.superficieTotal - b.superficieTotal) * factor;
      return (a.pisoNumero - b.pisoNumero) * factor;
    });
    return resultado;
  }, [unidades, tipologia, orientacion, estado, piso, supMin, supMax, orden]);

  return (
    <div className="mt-8">
      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-white/10 bg-stone-900/60 p-4">
        <label className="flex flex-col gap-1 text-xs text-stone-400">
          Tipología
          <select value={tipologia} onChange={(e) => setTipologia(e.target.value)} className={selectClase}>
            <option value="todas">Todas</option>
            {tipologias.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-stone-400">
          Orientación
          <select value={orientacion} onChange={(e) => setOrientacion(e.target.value)} className={selectClase}>
            <option value="todas">Todas</option>
            {orientaciones.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-stone-400">
          Estado
          <select value={estado} onChange={(e) => setEstado(e.target.value)} className={selectClase}>
            <option value="todos">Todos</option>
            <option value="disponible">Disponible</option>
            <option value="reservada">Reservada</option>
            <option value="vendida">Vendida</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-stone-400">
          Piso
          <select value={piso} onChange={(e) => setPiso(e.target.value)} className={selectClase}>
            <option value="todos">Todos</option>
            {pisos.map((p) => (
              <option key={p} value={p}>
                {p === 0 ? "Planta baja" : `Piso ${p}`}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-stone-400">
          Superficie mín. (m²)
          <input
            type="number"
            min={0}
            value={supMin}
            onChange={(e) => setSupMin(e.target.value)}
            className={`${selectClase} w-28`}
            placeholder="0"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-stone-400">
          Superficie máx. (m²)
          <input
            type="number"
            min={0}
            value={supMax}
            onChange={(e) => setSupMax(e.target.value)}
            className={`${selectClase} w-28`}
            placeholder="∞"
          />
        </label>
        <label className="ml-auto flex flex-col gap-1 text-xs text-stone-400">
          Ordenar por
          <select value={orden} onChange={(e) => setOrden(e.target.value)} className={selectClase}>
            {ORDENES.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.etiqueta}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Cards */}
      {filtradas.length === 0 ? (
        <p className="mt-12 text-center text-stone-400">
          No hay unidades que coincidan con los filtros.
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtradas.map((u) => (
            <Link
              key={u.id}
              href={u.esLocalComercial ? "/local-comercial" : `/proyecto/unidad/${u.id}`}
              className="group overflow-hidden rounded-lg border border-white/10 bg-stone-900/60 transition-colors hover:border-amber-400/50"
            >
              <div className="relative">
                <img
                  src={u.renderUrl ?? "https://picsum.photos/seed/render-generico/800/500"}
                  alt={`Render unidad ${u.numero}`}
                  className="aspect-[8/5] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span
                  className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-medium capitalize backdrop-blur ${ESTADO_ESTILO[u.estado] ?? ""}`}
                >
                  {u.estado}
                </span>
                {u.destacada && (
                  <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-amber-400/90 px-2.5 py-1 text-xs font-medium text-stone-950">
                    <Star className="h-3 w-3 fill-current" /> Destacada
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="font-display text-2xl text-white">
                    {u.esLocalComercial ? u.numero : `Unidad ${u.numero}`}
                  </h2>
                  {u.estado === "disponible" && (
                    <p className="text-sm font-semibold text-amber-300">
                      {formatearPrecio(u.precio)}
                    </p>
                  )}
                </div>
                <p className="mt-1 text-sm capitalize text-stone-400">
                  {u.tipologia} · {formatearSuperficie(u.superficieTotal)} · {u.orientacion}
                </p>
                <p className="text-xs text-stone-500">
                  {u.pisoNumero === 0 ? "Planta baja" : `Piso ${u.pisoNumero}`}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
