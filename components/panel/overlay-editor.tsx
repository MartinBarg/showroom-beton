"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Undo2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  centroide,
  parsePolygonPath,
  serializePolygonPath,
  type Point,
} from "@/lib/svg-polygon";

type OverlayDTO = { id: string; unidadId: string; unidadNumero: string; svgPath: string };
type UnidadDTO = { id: string; numero: string };

type Props = {
  vistaId: string;
  imagenUrl: string;
  overlays: OverlayDTO[];
  unidades: UnidadDTO[];
};

const AZUL = { fill: "rgba(96, 165, 250, 0.3)", stroke: "rgba(96, 165, 250, 0.9)" };
const VERDE = { fill: "rgba(52, 211, 153, 0.3)", stroke: "rgba(52, 211, 153, 0.9)" };
const AMBAR = { fill: "rgba(251, 191, 36, 0.3)", stroke: "rgba(251, 191, 36, 0.95)" };

export function OverlayEditor({ vistaId, imagenUrl, overlays, unidades }: Props) {
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [naturalSize, setNaturalSize] = useState({ w: 1600, h: 1000 });

  // Si la imagen ya está en caché del navegador, "onLoad" nunca se dispara.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth) {
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
    }
  }, [imagenUrl]);

  // Dibujo de una forma nueva
  const [dibujando, setDibujando] = useState(false);
  const [puntos, setPuntos] = useState<Point[]>([]);
  const [confirmando, setConfirmando] = useState(false);
  const [unidadNueva, setUnidadNueva] = useState(unidades[0]?.id ?? "");

  // Edición de una forma existente
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [puntosEdicion, setPuntosEdicion] = useState<Point[]>([]);
  const arrastrando = useRef<number | null>(null);

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const radio = Math.max(naturalSize.w, naturalSize.h) / 170;
  const grosor = Math.max(naturalSize.w, naturalSize.h) / 500;

  function aPuntoSvg(clientX: number, clientY: number): Point {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const transformado = pt.matrixTransform(ctm.inverse());
    return { x: Math.round(transformado.x), y: Math.round(transformado.y) };
  }

  function iniciarDibujo() {
    setSeleccionado(null);
    setDibujando(true);
    setConfirmando(false);
    setPuntos([]);
    setError(null);
  }

  function cancelarDibujo() {
    setDibujando(false);
    setConfirmando(false);
    setPuntos([]);
  }

  function clicSvg(e: React.PointerEvent<SVGSVGElement>) {
    if (!dibujando || confirmando) return;
    const p = aPuntoSvg(e.clientX, e.clientY);
    setPuntos((prev) => [...prev, p]);
  }

  async function llamar(url: string, method: string, body?: unknown) {
    setError(null);
    setGuardando(true);
    const res = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    setGuardando(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Error inesperado");
      return false;
    }
    router.refresh();
    return true;
  }

  async function guardarNuevo() {
    if (puntos.length < 3 || !unidadNueva) return;
    const ok = await llamar("/api/overlays", "POST", {
      vistaExteriorId: vistaId,
      unidadId: unidadNueva,
      svgPath: serializePolygonPath(puntos),
    });
    if (ok) cancelarDibujo();
  }

  function seleccionar(overlay: OverlayDTO) {
    if (dibujando) return;
    setSeleccionado(overlay.id);
    setPuntosEdicion(parsePolygonPath(overlay.svgPath));
  }

  function moverVertice(i: number, e: React.PointerEvent) {
    if (arrastrando.current !== i) return;
    const p = aPuntoSvg(e.clientX, e.clientY);
    setPuntosEdicion((prev) => prev.map((pt, idx) => (idx === i ? p : pt)));
  }

  async function guardarEdicion() {
    if (!seleccionado || puntosEdicion.length < 3) return;
    const ok = await llamar(`/api/overlays/${seleccionado}`, "PATCH", {
      svgPath: serializePolygonPath(puntosEdicion),
    });
    if (ok) setSeleccionado(null);
  }

  async function borrarSeleccionado() {
    if (!seleccionado) return;
    if (!window.confirm("¿Borrar este overlay?")) return;
    const ok = await llamar(`/api/overlays/${seleccionado}`, "DELETE");
    if (ok) setSeleccionado(null);
  }

  const overlaySeleccionado = overlays.find((o) => o.id === seleccionado);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div
        className="relative h-[600px] w-full overflow-hidden rounded-lg border bg-stone-900"
        style={{ touchAction: "none" }}
      >
        <img
          ref={imgRef}
          src={imagenUrl}
          alt=""
          className="absolute inset-0 h-full w-full bg-white object-contain"
          onLoad={(e) => {
            const img = e.currentTarget;
            setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
          }}
        />
        <svg
          ref={svgRef}
          viewBox={`0 0 ${naturalSize.w} ${naturalSize.h}`}
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 h-full w-full"
          style={{ cursor: dibujando && !confirmando ? "crosshair" : "default" }}
          onPointerDown={clicSvg}
        >
          {/* Overlays ya guardados */}
          {overlays.map((overlay) => {
            if (overlay.id === seleccionado) return null;
            const pts = parsePolygonPath(overlay.svgPath);
            const c = centroide(pts);
            return (
              <g key={overlay.id} onPointerDown={(e) => { e.stopPropagation(); seleccionar(overlay); }}>
                <polygon
                  points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
                  fill={AZUL.fill}
                  stroke={AZUL.stroke}
                  strokeWidth={grosor}
                  className="cursor-pointer hover:opacity-80"
                />
                <text
                  x={c.x}
                  y={c.y}
                  fill="white"
                  fontSize={radio * 1.8}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ pointerEvents: "none" }}
                >
                  {overlay.unidadNumero}
                </text>
              </g>
            );
          })}

          {/* Overlay en edición: vértices arrastrables */}
          {overlaySeleccionado && puntosEdicion.length > 0 && (
            <g>
              <polygon
                points={puntosEdicion.map((p) => `${p.x},${p.y}`).join(" ")}
                fill={AMBAR.fill}
                stroke={AMBAR.stroke}
                strokeWidth={grosor}
              />
              {puntosEdicion.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={radio}
                  fill={AMBAR.stroke}
                  stroke="white"
                  strokeWidth={grosor / 2}
                  className="cursor-grab"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    e.currentTarget.setPointerCapture(e.pointerId);
                    arrastrando.current = i;
                  }}
                  onPointerMove={(e) => moverVertice(i, e)}
                  onPointerUp={(e) => {
                    e.currentTarget.releasePointerCapture(e.pointerId);
                    arrastrando.current = null;
                  }}
                />
              ))}
            </g>
          )}

          {/* Forma en progreso */}
          {dibujando && puntos.length > 0 && (
            <g style={{ pointerEvents: "none" }}>
              {puntos.length > 1 && (
                <polyline
                  points={puntos.map((p) => `${p.x},${p.y}`).join(" ")}
                  fill="none"
                  stroke={VERDE.stroke}
                  strokeWidth={grosor}
                />
              )}
              {puntos.length > 2 && (
                <line
                  x1={puntos[puntos.length - 1].x}
                  y1={puntos[puntos.length - 1].y}
                  x2={puntos[0].x}
                  y2={puntos[0].y}
                  stroke={VERDE.stroke}
                  strokeWidth={grosor}
                  strokeDasharray={`${grosor * 3} ${grosor * 3}`}
                />
              )}
              {puntos.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={radio * 0.7} fill={VERDE.stroke} stroke="white" strokeWidth={grosor / 2} />
              ))}
            </g>
          )}
        </svg>
      </div>

      <div className="space-y-4">
        {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

        {!dibujando && !seleccionado && (
          <Button className="w-full" onClick={iniciarDibujo}>
            + Nueva forma
          </Button>
        )}

        {dibujando && !confirmando && (
          <div className="space-y-2 rounded-md border bg-card p-3">
            <p className="text-sm text-muted-foreground">
              Hacé click sobre la foto para marcar cada esquina del departamento. Necesitás al
              menos 3 puntos.
            </p>
            <p className="text-sm font-medium">Puntos: {puntos.length}</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={puntos.length === 0}
                onClick={() => setPuntos((prev) => prev.slice(0, -1))}
              >
                <Undo2 className="h-3.5 w-3.5" /> Deshacer punto
              </Button>
              <Button
                size="sm"
                disabled={puntos.length < 3}
                onClick={() => setConfirmando(true)}
              >
                Cerrar forma
              </Button>
              <Button variant="ghost" size="sm" onClick={cancelarDibujo}>
                <XCircle className="h-3.5 w-3.5" /> Cancelar
              </Button>
            </div>
          </div>
        )}

        {dibujando && confirmando && (
          <div className="space-y-3 rounded-md border bg-card p-3">
            <p className="text-sm font-medium">¿Qué unidad es esta forma?</p>
            <Select value={unidadNueva} onChange={(e) => setUnidadNueva(e.target.value)}>
              {unidades.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.numero}
                  {overlays.some((o) => o.unidadId === u.id) ? " (ya tiene overlay acá)" : ""}
                </option>
              ))}
            </Select>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" disabled={guardando} onClick={() => void guardarNuevo()}>
                Guardar overlay
              </Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmando(false)}>
                Seguir editando puntos
              </Button>
              <Button variant="ghost" size="sm" onClick={cancelarDibujo}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {overlaySeleccionado && (
          <div className="space-y-3 rounded-md border bg-card p-3">
            <p className="text-sm font-medium">Unidad {overlaySeleccionado.unidadNumero}</p>
            <p className="text-sm text-muted-foreground">
              Arrastrá los vértices para ajustar la forma.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" disabled={guardando} onClick={() => void guardarEdicion()}>
                Guardar cambios
              </Button>
              <Button variant="destructive" size="sm" onClick={() => void borrarSeleccionado()}>
                <Trash2 className="h-3.5 w-3.5" /> Eliminar
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSeleccionado(null)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        <div>
          <h3 className="text-sm font-medium">Overlays cargados ({overlays.length})</h3>
          <ul className="mt-2 space-y-1">
            {overlays.map((overlay) => (
              <li key={overlay.id}>
                <button
                  type="button"
                  onClick={() => seleccionar(overlay)}
                  className="w-full rounded-md border px-2.5 py-1.5 text-left text-sm hover:bg-secondary"
                >
                  Unidad {overlay.unidadNumero}
                </button>
              </li>
            ))}
            {overlays.length === 0 && (
              <li className="text-xs text-muted-foreground">Todavía no hay overlays en esta vista.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
