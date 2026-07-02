"use client";

import { useMemo, useState } from "react";
import { formatearPrecio, formatearSuperficie } from "@/lib/utils";
import { ESTADOS_UNIDAD } from "@/lib/types";
import { Select } from "@/components/ui/select";
import { EstadoBadge } from "@/components/estado-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type UnidadFila = {
  id: string;
  numero: string;
  tipologia: string;
  superficieTotal: number;
  orientacion: string;
  precio: number;
  estado: string;
  agenciaId: string | null;
  pisoNumero: number;
  esLocalComercial: boolean;
};

type Props = {
  unidadesIniciales: UnidadFila[];
  agencias: Array<{ id: string; nombre: string }>;
};

export function TablaUnidades({ unidadesIniciales, agencias }: Props) {
  const [unidades, setUnidades] = useState(unidadesIniciales);
  const [filtroPiso, setFiltroPiso] = useState("todos");
  const [filtroTipologia, setFiltroTipologia] = useState("todas");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState<string | null>(null);

  const pisos = useMemo(
    () => [...new Set(unidades.map((u) => u.pisoNumero))].sort((a, b) => a - b),
    [unidades]
  );
  const tipologias = useMemo(
    () => [...new Set(unidades.map((u) => u.tipologia))].sort(),
    [unidades]
  );

  const filtradas = unidades.filter((u) => {
    if (filtroPiso !== "todos" && u.pisoNumero !== Number(filtroPiso)) return false;
    if (filtroTipologia !== "todas" && u.tipologia !== filtroTipologia) return false;
    if (filtroEstado !== "todos" && u.estado !== filtroEstado) return false;
    return true;
  });

  async function actualizar(
    unidad: UnidadFila,
    cambios: { estado?: string; agenciaId?: string | null }
  ) {
    const anterior = unidades;
    setError(null);
    setGuardando(unidad.id);
    setUnidades((actuales) =>
      actuales.map((u) => (u.id === unidad.id ? { ...u, ...cambios } : u))
    );
    try {
      const res = await fetch(`/api/unidades/${unidad.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cambios),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "No se pudo actualizar la unidad");
      }
      // El backend limpia la agencia cuando la unidad vuelve a disponible
      if (cambios.estado === "disponible") {
        setUnidades((actuales) =>
          actuales.map((u) => (u.id === unidad.id ? { ...u, agenciaId: null } : u))
        );
      }
    } catch (e) {
      setUnidades(anterior);
      setError(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setGuardando(null);
    }
  }

  const selectFiltro =
    "h-9 w-auto rounded-md border border-input bg-card px-2 text-sm";

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Piso
          <select value={filtroPiso} onChange={(e) => setFiltroPiso(e.target.value)} className={selectFiltro}>
            <option value="todos">Todos</option>
            {pisos.map((p) => (
              <option key={p} value={p}>
                {p === 0 ? "PB" : p}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Tipología
          <select value={filtroTipologia} onChange={(e) => setFiltroTipologia(e.target.value)} className={selectFiltro}>
            <option value="todas">Todas</option>
            {tipologias.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Estado
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className={selectFiltro}>
            <option value="todos">Todos</option>
            {ESTADOS_UNIDAD.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </label>
        <span className="ml-auto text-sm text-muted-foreground">
          {filtradas.length} de {unidades.length} unidades
        </span>
      </div>

      {error && (
        <p className="mb-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      )}

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Unidad</TableHead>
              <TableHead>Piso</TableHead>
              <TableHead>Tipología</TableHead>
              <TableHead>Superficie</TableHead>
              <TableHead>Orientación</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Agencia</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtradas.map((u) => (
              <TableRow key={u.id} className={guardando === u.id ? "opacity-60" : ""}>
                <TableCell className="font-medium">
                  {u.numero}
                  {u.esLocalComercial && (
                    <span className="ml-2 rounded bg-secondary px-1.5 py-0.5 text-xs">
                      Local
                    </span>
                  )}
                </TableCell>
                <TableCell>{u.pisoNumero === 0 ? "PB" : u.pisoNumero}</TableCell>
                <TableCell className="capitalize">{u.tipologia}</TableCell>
                <TableCell>{formatearSuperficie(u.superficieTotal)}</TableCell>
                <TableCell>{u.orientacion}</TableCell>
                <TableCell className="text-right">{formatearPrecio(u.precio)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Select
                      className="h-9 w-32"
                      value={u.estado}
                      disabled={guardando === u.id}
                      onChange={(e) => {
                        const estado = e.target.value;
                        void actualizar(u, {
                          estado,
                          ...(estado === "disponible" && { agenciaId: null }),
                        });
                      }}
                    >
                      {ESTADOS_UNIDAD.map((estado) => (
                        <option key={estado} value={estado}>
                          {estado}
                        </option>
                      ))}
                    </Select>
                    <EstadoBadge estado={u.estado} />
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    className="h-9 w-44"
                    value={u.agenciaId ?? ""}
                    disabled={u.estado === "disponible" || guardando === u.id}
                    onChange={(e) =>
                      void actualizar(u, { agenciaId: e.target.value || null })
                    }
                  >
                    <option value="">Sin agencia</option>
                    {agencias.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nombre}
                      </option>
                    ))}
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
