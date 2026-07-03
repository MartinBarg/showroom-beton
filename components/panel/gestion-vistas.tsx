"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PenTool, Plus, Star, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type OverlayDTO = { id: string; unidadNumero: string; svgPath: string };

type VistaDTO = {
  id: string;
  nombre: string;
  imagenUrl: string;
  orden: number;
  esVistaInicial: boolean;
  overlays: OverlayDTO[];
};

type TransicionDTO = {
  id: string;
  vistaOrigenId: string;
  vistaDestinoId: string;
  videoUrl: string | null;
};

type Props = {
  vistas: VistaDTO[];
  transiciones: TransicionDTO[];
};

type FormVista = {
  id: string | null;
  nombre: string;
  imagenUrl: string;
  orden: string;
  esVistaInicial: boolean;
};

export function GestionVistas({ vistas, transiciones }: Props) {
  const router = useRouter();
  const [formVista, setFormVista] = useState<FormVista | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videos, setVideos] = useState<Record<string, string>>(() => {
    const inicial: Record<string, string> = {};
    for (const t of transiciones) {
      inicial[`${t.vistaOrigenId}:${t.vistaDestinoId}`] = t.videoUrl ?? "";
    }
    return inicial;
  });

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

  async function guardarVista(e: React.FormEvent) {
    e.preventDefault();
    if (!formVista) return;
    const payload = {
      nombre: formVista.nombre,
      imagenUrl: formVista.imagenUrl,
      orden: Number(formVista.orden),
      esVistaInicial: formVista.esVistaInicial,
    };
    const ok = formVista.id
      ? await llamar(`/api/vistas/${formVista.id}`, "PATCH", payload)
      : await llamar("/api/vistas", "POST", payload);
    if (ok) setFormVista(null);
  }

  return (
    <div className="space-y-8">
      {error && (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      )}

      <Button
        onClick={() =>
          setFormVista({ id: null, nombre: "", imagenUrl: "", orden: String(vistas.length + 1), esVistaInicial: false })
        }
      >
        <Plus className="h-4 w-4" /> Nueva vista
      </Button>

      {/* Vistas con sus overlays */}
      <div className="grid gap-6 lg:grid-cols-2">
        {vistas.map((vista) => (
          <Card key={vista.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {vista.nombre}
                    {vista.esVistaInicial && <Badge variant="warning">Inicial</Badge>}
                  </CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">Orden: {vista.orden}</p>
                </div>
                <div className="flex gap-2">
                  {!vista.esVistaInicial && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        void llamar(`/api/vistas/${vista.id}`, "PATCH", { esVistaInicial: true })
                      }
                    >
                      <Star className="h-3.5 w-3.5" /> Inicial
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFormVista({
                        id: vista.id,
                        nombre: vista.nombre,
                        imagenUrl: vista.imagenUrl,
                        orden: String(vista.orden),
                        esVistaInicial: vista.esVistaInicial,
                      })
                    }
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (window.confirm(`¿Borrar la vista "${vista.nombre}" y sus overlays?`)) {
                        void llamar(`/api/vistas/${vista.id}`, "DELETE");
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <img
                src={vista.imagenUrl}
                alt={vista.nombre}
                className="aspect-video w-full rounded-md object-cover"
              />

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">
                    Overlays ({vista.overlays.length})
                  </h3>
                  <Link
                    href={`/panel-interno/vistas-exterior/${vista.id}`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    <PenTool className="h-3.5 w-3.5" /> Editor visual
                  </Link>
                </div>
                <ul className="mt-2 divide-y text-sm">
                  {vista.overlays.map((overlay) => (
                    <li key={overlay.id} className="flex items-center gap-3 py-1.5">
                      <span className="font-medium">U. {overlay.unidadNumero}</span>
                      <code className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                        {overlay.svgPath}
                      </code>
                      <button
                        type="button"
                        className="text-rose-600 hover:text-rose-800"
                        aria-label="Borrar overlay"
                        onClick={() => void llamar(`/api/overlays/${overlay.id}`, "DELETE")}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                  {vista.overlays.length === 0 && (
                    <li className="py-1.5 text-xs text-muted-foreground">
                      Sin overlays: las unidades no se pueden clickear en esta vista.
                    </li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Transiciones */}
      <Card>
        <CardHeader>
          <CardTitle>Videos de transición</CardTitle>
          <p className="text-sm text-muted-foreground">
            URL del mp4 que se reproduce al pasar de una vista a otra. Vacío = crossfade CSS.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {vistas.flatMap((origen) =>
              vistas
                .filter((destino) => destino.id !== origen.id)
                .map((destino) => {
                  const clave = `${origen.id}:${destino.id}`;
                  return (
                    <form
                      key={clave}
                      className="flex flex-wrap items-center gap-3"
                      onSubmit={(e) => {
                        e.preventDefault();
                        void llamar("/api/transiciones", "POST", {
                          vistaOrigenId: origen.id,
                          vistaDestinoId: destino.id,
                          videoUrl: videos[clave]?.trim() ? videos[clave].trim() : null,
                        });
                      }}
                    >
                      <span className="w-56 shrink-0 text-sm">
                        {origen.nombre} → {destino.nombre}
                      </span>
                      <Input
                        className="min-w-0 flex-1"
                        placeholder="https://... (mp4) — vacío = crossfade"
                        value={videos[clave] ?? ""}
                        onChange={(e) => setVideos({ ...videos, [clave]: e.target.value })}
                      />
                      <Button type="submit" variant="outline" size="sm">
                        Guardar
                      </Button>
                    </form>
                  );
                })
            )}
            {vistas.length < 2 && (
              <p className="text-sm text-muted-foreground">
                Cargá al menos dos vistas para configurar transiciones.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal alta/edición de vista */}
      <Modal
        abierto={formVista !== null}
        onCerrar={() => setFormVista(null)}
        titulo={formVista?.id ? "Editar vista" : "Nueva vista"}
      >
        {formVista && (
          <form onSubmit={guardarVista} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="vista-nombre">Nombre</Label>
              <Input
                id="vista-nombre"
                required
                value={formVista.nombre}
                onChange={(e) => setFormVista({ ...formVista, nombre: e.target.value })}
                placeholder="Fachada Norte"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vista-imagen">URL de la imagen</Label>
              <Input
                id="vista-imagen"
                required
                type="url"
                value={formVista.imagenUrl}
                onChange={(e) => setFormVista({ ...formVista, imagenUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vista-orden">Orden</Label>
              <Input
                id="vista-orden"
                type="number"
                min={0}
                required
                value={formVista.orden}
                onChange={(e) => setFormVista({ ...formVista, orden: e.target.value })}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={formVista.esVistaInicial}
                onChange={(e) =>
                  setFormVista({ ...formVista, esVistaInicial: e.target.checked })
                }
              />
              Vista inicial del showroom
            </label>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setFormVista(null)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
