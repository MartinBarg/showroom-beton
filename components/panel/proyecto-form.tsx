"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ProyectoDatos = {
  nombre: string;
  descripcion: string;
  ubicacion: string;
  lat: number;
  lng: number;
  fechaEntrega: string;
  cantidadPisos: number;
  activo: boolean;
};

export function ProyectoForm({ proyecto }: { proyecto: ProyectoDatos }) {
  const router = useRouter();
  const [form, setForm] = useState(proyecto);
  const [estado, setEstado] = useState<"inicial" | "guardando" | "ok" | "error">("inicial");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEstado("guardando");
    try {
      const res = await fetch("/api/proyecto", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre,
          descripcion: form.descripcion,
          ubicacion: form.ubicacion,
          lat: Number(form.lat),
          lng: Number(form.lng),
          fechaEntrega: form.fechaEntrega || null,
          cantidadPisos: Number(form.cantidadPisos),
          activo: form.activo,
        }),
      });
      if (!res.ok) throw new Error();
      setEstado("ok");
      router.refresh();
    } catch {
      setEstado("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border bg-card p-6">
      <div className="space-y-1.5">
        <Label htmlFor="nombre">Nombre</Label>
        <Input
          id="nombre"
          required
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="descripcion">Descripción</Label>
        <Textarea
          id="descripcion"
          rows={4}
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ubicacion">Ubicación (texto)</Label>
        <Input
          id="ubicacion"
          value={form.ubicacion}
          onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="lat">Latitud</Label>
          <Input
            id="lat"
            type="number"
            step="any"
            value={form.lat}
            onChange={(e) => setForm({ ...form, lat: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lng">Longitud</Label>
          <Input
            id="lng"
            type="number"
            step="any"
            value={form.lng}
            onChange={(e) => setForm({ ...form, lng: Number(e.target.value) })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="fechaEntrega">Fecha de entrega</Label>
          <Input
            id="fechaEntrega"
            type="date"
            value={form.fechaEntrega}
            onChange={(e) => setForm({ ...form, fechaEntrega: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cantidadPisos">Cantidad de pisos</Label>
          <Input
            id="cantidadPisos"
            type="number"
            min={1}
            value={form.cantidadPisos}
            onChange={(e) => setForm({ ...form, cantidadPisos: Number(e.target.value) })}
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.activo}
          onChange={(e) => setForm({ ...form, activo: e.target.checked })}
          className="h-4 w-4"
        />
        Proyecto activo (visible en el showroom)
      </label>

      {estado === "ok" && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Cambios guardados.
        </p>
      )}
      {estado === "error" && (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
          No se pudieron guardar los cambios.
        </p>
      )}

      <Button type="submit" disabled={estado === "guardando"}>
        {estado === "guardando" ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
