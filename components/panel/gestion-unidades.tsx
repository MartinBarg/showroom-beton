"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Upload } from "lucide-react";
import { ESTADOS_UNIDAD, TIPOLOGIAS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EstadoBadge } from "@/components/estado-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type UnidadDTO = {
  id: string;
  numero: string;
  tipologia: string;
  superficieTotal: number;
  superficieCubierta: number;
  superficieDescubierta: number;
  orientacion: string;
  precio: number;
  estado: string;
  agenciaId: string | null;
  esLocalComercial: boolean;
  destacada: boolean;
  renderUrl: string | null;
  planoUrl: string | null;
  galeria: string[];
  tourKuulaUrl: string | null;
  descripcion: string | null;
};

type PisoDTO = { id: string; numero: number; unidades: UnidadDTO[] };

type Props = {
  pisos: PisoDTO[];
  agencias: Array<{ id: string; nombre: string }>;
};

type FormUnidad = {
  id: string | null;
  pisoId: string;
  numero: string;
  tipologia: string;
  superficieTotal: string;
  superficieCubierta: string;
  superficieDescubierta: string;
  orientacion: string;
  precio: string;
  estado: string;
  agenciaId: string;
  esLocalComercial: boolean;
  destacada: boolean;
  renderUrl: string;
  planoUrl: string;
  galeria: string;
  tourKuulaUrl: string;
  descripcion: string;
};

function formVacio(pisoId: string): FormUnidad {
  return {
    id: null,
    pisoId,
    numero: "",
    tipologia: "2 ambientes",
    superficieTotal: "",
    superficieCubierta: "",
    superficieDescubierta: "0",
    orientacion: "Norte",
    precio: "",
    estado: "disponible",
    agenciaId: "",
    esLocalComercial: false,
    destacada: false,
    renderUrl: "",
    planoUrl: "",
    galeria: "",
    tourKuulaUrl: "",
    descripcion: "",
  };
}

export function GestionUnidades({ pisos, agencias }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormUnidad | null>(null);
  const [nuevoPiso, setNuevoPiso] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState<"render" | "plano" | null>(null);
  const inputRender = useRef<HTMLInputElement>(null);
  const inputPlano = useRef<HTMLInputElement>(null);

  async function llamar(url: string, method: string, body?: unknown) {
    setError(null);
    const res = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Error inesperado");
      return false;
    }
    router.refresh();
    return true;
  }

  async function crearPiso(e: React.FormEvent) {
    e.preventDefault();
    if (nuevoPiso === "") return;
    const ok = await llamar("/api/pisos", "POST", { numero: Number(nuevoPiso) });
    if (ok) setNuevoPiso("");
  }

  async function subirArchivo(campo: "render" | "plano", archivo: File) {
    setSubiendo(campo);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("archivo", archivo);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "No se pudo subir el archivo");
      setForm((f) =>
        f ? { ...f, [campo === "render" ? "renderUrl" : "planoUrl"]: data.url } : f
      );
      if (data.simulado) {
        setError(
          "R2 no está configurado: se usó una URL placeholder en lugar de subir el archivo."
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error subiendo archivo");
    } finally {
      setSubiendo(null);
    }
  }

  async function guardarUnidad(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setGuardando(true);
    const payload = {
      ...(form.id ? {} : { pisoId: form.pisoId }),
      numero: form.numero,
      tipologia: form.tipologia,
      superficieTotal: Number(form.superficieTotal),
      superficieCubierta: Number(form.superficieCubierta),
      superficieDescubierta: Number(form.superficieDescubierta),
      orientacion: form.orientacion,
      precio: Number(form.precio),
      estado: form.estado,
      agenciaId: form.agenciaId || null,
      esLocalComercial: form.esLocalComercial,
      destacada: form.destacada,
      renderUrl: form.renderUrl.trim() || null,
      planoUrl: form.planoUrl.trim() || null,
      galeria: form.galeria
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean),
      tourKuulaUrl: form.tourKuulaUrl.trim() || null,
      descripcion: form.descripcion.trim() || null,
    };
    const ok = form.id
      ? await llamar(`/api/unidades/${form.id}`, "PATCH", payload)
      : await llamar("/api/unidades", "POST", payload);
    setGuardando(false);
    if (ok) setForm(null);
  }

  const inputArchivo = (
    campo: "render" | "plano",
    ref: React.RefObject<HTMLInputElement>
  ) => (
    <div className="flex gap-2">
      <Input
        type="url"
        value={campo === "render" ? form?.renderUrl ?? "" : form?.planoUrl ?? ""}
        onChange={(e) =>
          setForm((f) =>
            f ? { ...f, [campo === "render" ? "renderUrl" : "planoUrl"]: e.target.value } : f
          )
        }
        placeholder="https://..."
      />
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const archivo = e.target.files?.[0];
          if (archivo) void subirArchivo(campo, archivo);
          e.target.value = "";
        }}
      />
      <Button
        type="button"
        variant="outline"
        disabled={subiendo !== null}
        onClick={() => ref.current?.click()}
      >
        <Upload className="h-4 w-4" />
        {subiendo === campo ? "Subiendo..." : "Subir"}
      </Button>
    </div>
  );

  return (
    <div className="space-y-8">
      {error && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</p>
      )}

      {/* Alta de piso */}
      <form onSubmit={crearPiso} className="flex items-end gap-3 rounded-lg border bg-card p-4">
        <div className="space-y-1.5">
          <Label htmlFor="nuevo-piso">Nuevo piso (número)</Label>
          <Input
            id="nuevo-piso"
            type="number"
            min={0}
            className="w-36"
            value={nuevoPiso}
            onChange={(e) => setNuevoPiso(e.target.value)}
            placeholder="6"
          />
        </div>
        <Button type="submit" disabled={nuevoPiso === ""}>
          <Plus className="h-4 w-4" /> Agregar piso
        </Button>
      </form>

      {/* Pisos con sus unidades */}
      {pisos.map((piso) => (
        <section key={piso.id} className="rounded-lg border bg-card">
          <header className="flex items-center justify-between border-b px-5 py-3">
            <h2 className="font-semibold">
              {piso.numero === 0 ? "Planta baja" : `Piso ${piso.numero}`}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {piso.unidades.length} unidades
              </span>
            </h2>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setForm(formVacio(piso.id))}>
                <Plus className="h-3.5 w-3.5" /> Nueva unidad
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={piso.unidades.length > 0}
                title={
                  piso.unidades.length > 0
                    ? "Borrá primero las unidades del piso"
                    : "Borrar piso"
                }
                onClick={() => {
                  if (window.confirm(`¿Borrar el piso ${piso.numero}?`)) {
                    void llamar(`/api/pisos/${piso.id}`, "DELETE");
                  }
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </header>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Tipología</TableHead>
                <TableHead>Sup. total</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Contenido</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {piso.unidades.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    {u.numero}
                    {u.esLocalComercial && (
                      <span className="ml-2 rounded bg-secondary px-1.5 py-0.5 text-xs">
                        Local
                      </span>
                    )}
                    {u.destacada && (
                      <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">
                        Destacada
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="capitalize">{u.tipologia}</TableCell>
                  <TableCell>{u.superficieTotal} m²</TableCell>
                  <TableCell className="text-right">
                    USD {u.precio.toLocaleString("es-AR")}
                  </TableCell>
                  <TableCell>
                    <EstadoBadge estado={u.estado} />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {[
                      u.renderUrl && "render",
                      u.planoUrl && "plano",
                      u.galeria.length > 0 && `galería (${u.galeria.length})`,
                      u.tourKuulaUrl && "tour 360",
                    ]
                      .filter(Boolean)
                      .join(" · ") || "sin contenido"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setForm({
                            id: u.id,
                            pisoId: piso.id,
                            numero: u.numero,
                            tipologia: u.tipologia,
                            superficieTotal: String(u.superficieTotal),
                            superficieCubierta: String(u.superficieCubierta),
                            superficieDescubierta: String(u.superficieDescubierta),
                            orientacion: u.orientacion,
                            precio: String(u.precio),
                            estado: u.estado,
                            agenciaId: u.agenciaId ?? "",
                            esLocalComercial: u.esLocalComercial,
                            destacada: u.destacada,
                            renderUrl: u.renderUrl ?? "",
                            planoUrl: u.planoUrl ?? "",
                            galeria: u.galeria.join("\n"),
                            tourKuulaUrl: u.tourKuulaUrl ?? "",
                            descripcion: u.descripcion ?? "",
                          })
                        }
                      >
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (window.confirm(`¿Borrar la unidad ${u.numero}?`)) {
                            void llamar(`/api/unidades/${u.id}`, "DELETE");
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {piso.unidades.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-6 text-center text-muted-foreground">
                    Piso sin unidades.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </section>
      ))}

      {/* Modal alta/edición de unidad */}
      <Modal
        abierto={form !== null}
        onCerrar={() => setForm(null)}
        titulo={form?.id ? `Editar unidad ${form.numero}` : "Nueva unidad"}
        className="max-w-2xl"
      >
        {form && (
          <form onSubmit={guardarUnidad} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Número</Label>
                <Input
                  required
                  value={form.numero}
                  onChange={(e) => setForm({ ...form, numero: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tipología</Label>
                <Select
                  value={form.tipologia}
                  onChange={(e) => setForm({ ...form, tipologia: e.target.value })}
                >
                  {TIPOLOGIAS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Orientación</Label>
                <Input
                  required
                  value={form.orientacion}
                  onChange={(e) => setForm({ ...form, orientacion: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Sup. total (m²)</Label>
                <Input
                  required
                  type="number"
                  step="0.1"
                  min={1}
                  value={form.superficieTotal}
                  onChange={(e) => setForm({ ...form, superficieTotal: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Sup. cubierta (m²)</Label>
                <Input
                  required
                  type="number"
                  step="0.1"
                  min={0}
                  value={form.superficieCubierta}
                  onChange={(e) => setForm({ ...form, superficieCubierta: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Sup. descubierta (m²)</Label>
                <Input
                  required
                  type="number"
                  step="0.1"
                  min={0}
                  value={form.superficieDescubierta}
                  onChange={(e) => setForm({ ...form, superficieDescubierta: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Precio (USD)</Label>
                <Input
                  required
                  type="number"
                  min={0}
                  value={form.precio}
                  onChange={(e) => setForm({ ...form, precio: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Estado</Label>
                <Select
                  value={form.estado}
                  onChange={(e) => setForm({ ...form, estado: e.target.value })}
                >
                  {ESTADOS_UNIDAD.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Agencia</Label>
                <Select
                  value={form.agenciaId}
                  disabled={form.estado === "disponible"}
                  onChange={(e) => setForm({ ...form, agenciaId: e.target.value })}
                >
                  <option value="">Sin agencia</option>
                  {agencias.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={form.esLocalComercial}
                  onChange={(e) => setForm({ ...form, esLocalComercial: e.target.checked })}
                />
                Local comercial
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={form.destacada}
                  onChange={(e) => setForm({ ...form, destacada: e.target.checked })}
                />
                Destacada
              </label>
            </div>

            <div className="space-y-1.5">
              <Label>Render (URL o subir archivo)</Label>
              {inputArchivo("render", inputRender)}
            </div>
            <div className="space-y-1.5">
              <Label>Plano (URL o subir archivo)</Label>
              {inputArchivo("plano", inputPlano)}
            </div>
            <div className="space-y-1.5">
              <Label>Galería (una URL por línea)</Label>
              <Textarea
                rows={4}
                value={form.galeria}
                onChange={(e) => setForm({ ...form, galeria: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tour 360 (URL de Kuula)</Label>
              <Input
                type="url"
                value={form.tourKuulaUrl}
                onChange={(e) => setForm({ ...form, tourKuulaUrl: e.target.value })}
                placeholder="https://kuula.co/share/..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Descripción</Label>
              <Textarea
                rows={3}
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setForm(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={guardando}>
                {guardando ? "Guardando..." : "Guardar unidad"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
