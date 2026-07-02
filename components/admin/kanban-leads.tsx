"use client";

import { useMemo, useState } from "react";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { Mail, Phone } from "lucide-react";
import { ESTADOS_LEAD } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export type LeadKanban = {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  mensaje: string | null;
  estado: string;
  unidadNumero: string | null;
  agenciaId: string | null;
  agenciaNombre: string | null;
  creadoEn: string;
};

type Props = {
  leadsIniciales: LeadKanban[];
  agencias: Array<{ id: string; nombre: string }>;
  puedeAsignar: boolean;
};

const COLOR_COLUMNA: Record<string, string> = {
  Lead: "border-t-sky-400",
  Contactado: "border-t-indigo-400",
  Seguimiento: "border-t-violet-400",
  Reserva: "border-t-amber-400",
  Standby: "border-t-stone-400",
  Won: "border-t-emerald-500",
  Lost: "border-t-rose-400",
};

export function KanbanLeads({ leadsIniciales, agencias, puedeAsignar }: Props) {
  const [leads, setLeads] = useState(leadsIniciales);
  const [detalle, setDetalle] = useState<LeadKanban | null>(null);
  const [error, setError] = useState<string | null>(null);

  const columnas = useMemo(() => {
    const grupos = new Map<string, LeadKanban[]>(ESTADOS_LEAD.map((e) => [e, []]));
    for (const lead of leads) grupos.get(lead.estado)?.push(lead);
    return grupos;
  }, [leads]);

  async function actualizarLead(id: string, cambios: { estado?: string; agenciaId?: string | null }) {
    const res = await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cambios),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error ?? "No se pudo actualizar el lead");
    }
  }

  function onDragEnd(resultado: DropResult) {
    const { draggableId, destination, source } = resultado;
    if (!destination || destination.droppableId === source.droppableId) return;

    const anterior = leads;
    const nuevoEstado = destination.droppableId;
    setError(null);
    setLeads((actuales) =>
      actuales.map((l) => (l.id === draggableId ? { ...l, estado: nuevoEstado } : l))
    );
    actualizarLead(draggableId, { estado: nuevoEstado }).catch((e: Error) => {
      setLeads(anterior);
      setError(e.message);
    });
  }

  async function asignarAgencia(agenciaId: string) {
    if (!detalle) return;
    const valor = agenciaId === "" ? null : agenciaId;
    try {
      await actualizarLead(detalle.id, { agenciaId: valor });
      const nombre = agencias.find((a) => a.id === valor)?.nombre ?? null;
      setLeads((actuales) =>
        actuales.map((l) =>
          l.id === detalle.id ? { ...l, agenciaId: valor, agenciaNombre: nombre } : l
        )
      );
      setDetalle((d) => (d ? { ...d, agenciaId: valor, agenciaNombre: nombre } : d));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al asignar agencia");
    }
  }

  return (
    <div>
      {error && (
        <p className="mb-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      )}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {ESTADOS_LEAD.map((estado) => {
            const items = columnas.get(estado) ?? [];
            return (
              <div
                key={estado}
                className={cn(
                  "w-64 shrink-0 rounded-lg border border-t-4 bg-secondary/50",
                  COLOR_COLUMNA[estado]
                )}
              >
                <div className="flex items-center justify-between px-3 py-2.5">
                  <h3 className="text-sm font-semibold">{estado}</h3>
                  <span className="rounded-full bg-card px-2 py-0.5 text-xs text-muted-foreground">
                    {items.length}
                  </span>
                </div>
                <Droppable droppableId={estado}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "min-h-[120px] space-y-2 px-2 pb-2",
                        snapshot.isDraggingOver && "bg-accent/10"
                      )}
                    >
                      {items.map((lead, indice) => (
                        <Draggable key={lead.id} draggableId={lead.id} index={indice}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => setDetalle(lead)}
                              className={cn(
                                "cursor-pointer rounded-md border bg-card p-3 text-sm shadow-sm transition-shadow hover:shadow",
                                snapshot.isDragging && "rotate-1 shadow-lg"
                              )}
                            >
                              <p className="font-medium">{lead.nombre}</p>
                              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                {lead.email}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                                {lead.unidadNumero && (
                                  <span className="rounded bg-secondary px-1.5 py-0.5">
                                    U. {lead.unidadNumero}
                                  </span>
                                )}
                                {lead.agenciaNombre && (
                                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-800">
                                    {lead.agenciaNombre}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      <Modal
        abierto={detalle !== null}
        onCerrar={() => setDetalle(null)}
        titulo={detalle?.nombre ?? ""}
      >
        {detalle && (
          <div className="space-y-4 text-sm">
            <div className="space-y-1.5">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${detalle.email}`} className="hover:underline">
                  {detalle.email}
                </a>
              </p>
              {detalle.telefono && (
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {detalle.telefono}
                </p>
              )}
            </div>
            {detalle.mensaje && (
              <blockquote className="rounded-md bg-secondary p-3 italic text-muted-foreground">
                “{detalle.mensaje}”
              </blockquote>
            )}
            <dl className="grid grid-cols-2 gap-2">
              <div>
                <dt className="text-xs text-muted-foreground">Estado</dt>
                <dd>{detalle.estado}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Unidad de interés</dt>
                <dd>{detalle.unidadNumero ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Ingresado</dt>
                <dd>{new Date(detalle.creadoEn).toLocaleDateString("es-AR")}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Agencia</dt>
                <dd>{detalle.agenciaNombre ?? "Sin asignar"}</dd>
              </div>
            </dl>
            {puedeAsignar && (
              <div className="space-y-1.5 border-t pt-4">
                <Label htmlFor="asignar-agencia">Asignar agencia</Label>
                <Select
                  id="asignar-agencia"
                  value={detalle.agenciaId ?? ""}
                  onChange={(e) => asignarAgencia(e.target.value)}
                >
                  <option value="">Sin asignar</option>
                  {agencias.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre}
                    </option>
                  ))}
                </Select>
              </div>
            )}
            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setDetalle(null)}>
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
