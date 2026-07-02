import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { formatearPrecio, formatearSuperficie } from "@/lib/utils";
import { TabsFicha } from "./tabs-ficha";

export type UnidadFicha = {
  id: string;
  numero: string;
  tipologia: string;
  superficieTotal: number;
  superficieCubierta: number;
  superficieDescubierta: number;
  orientacion: string;
  precio: number;
  estado: string;
  renderUrl: string | null;
  descripcion: string | null;
  pisoNumero: number;
  esLocalComercial: boolean;
};

const ESTADO_ESTILO: Record<string, string> = {
  disponible: "bg-emerald-400/15 text-emerald-300 border-emerald-400/40",
  reservada: "bg-amber-400/15 text-amber-300 border-amber-400/40",
  vendida: "bg-rose-500/15 text-rose-300 border-rose-500/40",
};

type Props = {
  unidad: UnidadFicha;
  basePath: string;
  children: React.ReactNode;
  extra?: React.ReactNode;
};

// Layout fijo de la ficha: render de fondo, ficha técnica superpuesta,
// navegación Plano/Galería/Tour 360 y botón de contacto siempre visible.
export function FichaUnidadShell({ unidad, basePath, children, extra }: Props) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      {/* Render de fondo */}
      <img
        src={unidad.renderUrl ?? "https://picsum.photos/seed/render-generico/1920/1080"}
        alt=""
        className="pointer-events-none fixed inset-0 h-full w-full object-cover opacity-30"
      />
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-stone-950/80 via-stone-950/70 to-stone-950" />

      <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px]">
        {/* Contenido de la pestaña activa */}
        <div className="min-w-0">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <TabsFicha basePath={basePath} />
            <Link
              href={`/contacto?unidad=${unidad.id}`}
              className="inline-flex items-center gap-2 rounded-md bg-amber-400 px-4 py-2 text-sm font-medium text-stone-950 transition-colors hover:bg-amber-300"
            >
              <MessageCircle className="h-4 w-4" />
              Consultar
            </Link>
          </div>
          {children}
        </div>

        {/* Ficha técnica */}
        <aside className="h-fit rounded-lg border border-white/10 bg-stone-950/80 p-6 backdrop-blur lg:sticky lg:top-24">
          <p className="text-xs uppercase tracking-widest text-amber-400">
            {unidad.esLocalComercial
              ? "Local comercial"
              : `Piso ${unidad.pisoNumero}`}
          </p>
          <h1 className="mt-1 font-display text-4xl text-white">
            {unidad.esLocalComercial ? unidad.numero : `Unidad ${unidad.numero}`}
          </h1>
          <span
            className={`mt-3 inline-block rounded-full border px-3 py-1 text-xs font-medium capitalize ${ESTADO_ESTILO[unidad.estado] ?? ESTADO_ESTILO.disponible}`}
          >
            {unidad.estado}
          </span>

          <dl className="mt-5 space-y-2.5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-stone-400">Tipología</dt>
              <dd className="capitalize text-stone-100">{unidad.tipologia}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-stone-400">Superficie total</dt>
              <dd className="text-stone-100">{formatearSuperficie(unidad.superficieTotal)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-stone-400">Cubierta</dt>
              <dd className="text-stone-100">{formatearSuperficie(unidad.superficieCubierta)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-stone-400">Descubierta</dt>
              <dd className="text-stone-100">
                {formatearSuperficie(unidad.superficieDescubierta)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-stone-400">Orientación</dt>
              <dd className="text-stone-100">{unidad.orientacion}</dd>
            </div>
            {unidad.estado === "disponible" && (
              <div className="flex justify-between gap-4 border-t border-white/10 pt-2.5">
                <dt className="text-stone-400">Precio</dt>
                <dd className="text-lg font-semibold text-amber-300">
                  {formatearPrecio(unidad.precio)}
                </dd>
              </div>
            )}
          </dl>

          {unidad.descripcion && (
            <p className="mt-5 border-t border-white/10 pt-4 text-sm leading-relaxed text-stone-300">
              {unidad.descripcion}
            </p>
          )}

          {extra}

          <Link
            href={`/contacto?unidad=${unidad.id}`}
            className="mt-6 block rounded-md border border-amber-400/60 px-4 py-2.5 text-center text-sm font-medium text-amber-300 transition-colors hover:bg-amber-400 hover:text-stone-950"
          >
            Consultar por esta unidad
          </Link>
        </aside>
      </div>
    </div>
  );
}
