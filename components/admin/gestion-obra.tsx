"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

type Avance = {
  id: string;
  titulo: string;
  descripcion: string;
  imagenes: string[];
  fechaPublicacion: string; // YYYY-MM-DD
};

type FormularioAvance = {
  id: string | null;
  titulo: string;
  descripcion: string;
  imagenes: string;
  fechaPublicacion: string;
};

const FORM_VACIO: FormularioAvance = {
  id: null,
  titulo: "",
  descripcion: "",
  imagenes: "",
  fechaPublicacion: new Date().toISOString().slice(0, 10),
};

export function GestionObra({ avancesIniciales }: { avancesIniciales: Avance[] }) {
  const router = useRouter();
  const [form, setForm] = useState<FormularioAvance | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setGuardando(true);
    setError(null);
    try {
      const payload = {
        titulo: form.titulo,
        descripcion: form.descripcion,
        imagenes: form.imagenes
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean),
        fechaPublicacion: form.fechaPublicacion,
      };
      const res = await fetch(form.id ? `/api/obra/${form.id}` : "/api/obra", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "No se pudo guardar el avance");
      }
      setForm(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setGuardando(false);
    }
  }

  async function borrar(avance: Avance) {
    if (!window.confirm(`¿Borrar "${avance.titulo}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    const res = await fetch(`/api/obra/${avance.id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  return (
    <div>
      <div className="mb-4">
        <Button onClick={() => setForm(FORM_VACIO)}>
          <Plus className="h-4 w-4" /> Nuevo avance
        </Button>
      </div>

      <div className="space-y-4">
        {avancesIniciales.length === 0 && (
          <p className="text-sm text-muted-foreground">Todavía no hay avances publicados.</p>
        )}
        {avancesIniciales.map((avance) => (
          <Card key={avance.id}>
            <CardContent className="flex flex-wrap items-start gap-4 p-5">
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {avance.fechaPublicacion}
                </p>
                <h2 className="mt-1 font-semibold">{avance.titulo}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {avance.descripcion}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {avance.imagenes.length} imágenes
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setForm({
                      id: avance.id,
                      titulo: avance.titulo,
                      descripcion: avance.descripcion,
                      imagenes: avance.imagenes.join("\n"),
                      fechaPublicacion: avance.fechaPublicacion,
                    })
                  }
                >
                  <Pencil className="h-3.5 w-3.5" /> Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => void borrar(avance)}>
                  <Trash2 className="h-3.5 w-3.5" /> Borrar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal
        abierto={form !== null}
        onCerrar={() => setForm(null)}
        titulo={form?.id ? "Editar avance" : "Nuevo avance"}
      >
        {form && (
          <form onSubmit={guardar} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                required
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                required
                rows={4}
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fecha">Fecha de publicación</Label>
              <Input
                id="fecha"
                type="date"
                required
                value={form.fechaPublicacion}
                onChange={(e) => setForm({ ...form, fechaPublicacion: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="imagenes">Imágenes (una URL por línea)</Label>
              <Textarea
                id="imagenes"
                rows={4}
                value={form.imagenes}
                onChange={(e) => setForm({ ...form, imagenes: e.target.value })}
                placeholder="https://..."
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
                {guardando ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
