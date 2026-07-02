"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Plus } from "lucide-react";
import { formatearPrecio } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Comision = {
  id: string;
  agenciaId: string;
  agenciaNombre: string;
  unidadNumero: string | null;
  concepto: string;
  monto: number;
  estado: string;
  fechaPago: string | null;
};

type Props = {
  comisionesIniciales: Comision[];
  agencias: Array<{ id: string; nombre: string }>;
  unidades: Array<{ id: string; numero: string }>;
};

const FORM_VACIO = {
  agenciaId: "",
  unidadId: "",
  concepto: "",
  monto: "",
};

export function GestionPagos({ comisionesIniciales, agencias, unidades }: Props) {
  const router = useRouter();
  const [filtroAgencia, setFiltroAgencia] = useState("todas");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [form, setForm] = useState<typeof FORM_VACIO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const filtradas = useMemo(
    () =>
      comisionesIniciales.filter((c) => {
        if (filtroAgencia !== "todas" && c.agenciaId !== filtroAgencia) return false;
        if (filtroEstado !== "todos" && c.estado !== filtroEstado) return false;
        return true;
      }),
    [comisionesIniciales, filtroAgencia, filtroEstado]
  );

  const totalPendiente = filtradas
    .filter((c) => c.estado === "pendiente")
    .reduce((suma, c) => suma + c.monto, 0);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setGuardando(true);
    setError(null);
    try {
      const res = await fetch("/api/comisiones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agenciaId: form.agenciaId,
          unidadId: form.unidadId || null,
          concepto: form.concepto,
          monto: Number(form.monto),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "No se pudo crear la comisión");
      }
      setForm(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setGuardando(false);
    }
  }

  async function marcarPagada(comision: Comision) {
    const res = await fetch(`/api/comisiones/${comision.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "pagada" }),
    });
    if (res.ok) router.refresh();
  }

  const selectFiltro = "h-9 w-auto rounded-md border border-input bg-card px-2 text-sm";

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Agencia
          <select
            value={filtroAgencia}
            onChange={(e) => setFiltroAgencia(e.target.value)}
            className={selectFiltro}
          >
            <option value="todas">Todas</option>
            {agencias.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Estado
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className={selectFiltro}
          >
            <option value="todos">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="pagada">Pagada</option>
          </select>
        </label>
        <span className="text-sm text-muted-foreground">
          Pendiente en vista: <strong>{formatearPrecio(totalPendiente)}</strong>
        </span>
        <Button className="ml-auto" onClick={() => setForm(FORM_VACIO)}>
          <Plus className="h-4 w-4" /> Nueva comisión
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agencia</TableHead>
              <TableHead>Unidad</TableHead>
              <TableHead>Concepto</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha de pago</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtradas.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  No hay comisiones con estos filtros.
                </TableCell>
              </TableRow>
            )}
            {filtradas.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.agenciaNombre}</TableCell>
                <TableCell>{c.unidadNumero ?? "—"}</TableCell>
                <TableCell>{c.concepto}</TableCell>
                <TableCell className="text-right">{formatearPrecio(c.monto)}</TableCell>
                <TableCell>
                  <Badge variant={c.estado === "pagada" ? "success" : "warning"}>
                    {c.estado}
                  </Badge>
                </TableCell>
                <TableCell>{c.fechaPago ?? "—"}</TableCell>
                <TableCell className="text-right">
                  {c.estado === "pendiente" && (
                    <Button variant="outline" size="sm" onClick={() => void marcarPagada(c)}>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Marcar pagada
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Modal abierto={form !== null} onCerrar={() => setForm(null)} titulo="Nueva comisión">
        {form && (
          <form onSubmit={crear} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="agencia">Agencia</Label>
              <Select
                id="agencia"
                required
                value={form.agenciaId}
                onChange={(e) => setForm({ ...form, agenciaId: e.target.value })}
              >
                <option value="">Elegir agencia...</option>
                {agencias.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="unidad">Unidad (opcional)</Label>
              <Select
                id="unidad"
                value={form.unidadId}
                onChange={(e) => setForm({ ...form, unidadId: e.target.value })}
              >
                <option value="">Sin unidad asociada</option>
                {unidades.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.numero}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="concepto">Concepto</Label>
              <Input
                id="concepto"
                required
                value={form.concepto}
                onChange={(e) => setForm({ ...form, concepto: e.target.value })}
                placeholder="Comisión venta unidad..."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="monto">Monto (USD)</Label>
              <Input
                id="monto"
                type="number"
                min={0}
                step="0.01"
                required
                value={form.monto}
                onChange={(e) => setForm({ ...form, monto: e.target.value })}
              />
            </div>
            {error && (
              <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setForm(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={guardando}>
                {guardando ? "Guardando..." : "Crear comisión"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
