import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { OverlayEditor } from "@/components/panel/overlay-editor";

export default async function EditorOverlaysPage({ params }: { params: { id: string } }) {
  const vista = await prisma.vistaExterior.findUnique({
    where: { id: params.id },
    include: { overlays: { include: { unidad: { select: { numero: true } } } } },
  });
  if (!vista) notFound();

  const unidades = await prisma.unidad.findMany({
    select: { id: true, numero: true },
    orderBy: { numero: "asc" },
  });

  return (
    <div>
      <Link
        href="/panel-interno/vistas-exterior"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Vistas exteriores
      </Link>
      <h1 className="mt-2 text-2xl font-semibold">Editor de overlays — {vista.nombre}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Dibujá un polígono por unidad sobre la foto real. Se puede editar la forma después
        arrastrando sus vértices.
      </p>
      <div className="mt-6">
        <OverlayEditor
          vistaId={vista.id}
          imagenUrl={vista.imagenUrl}
          overlays={vista.overlays.map((o) => ({
            id: o.id,
            unidadId: o.unidadId,
            unidadNumero: o.unidad.numero,
            svgPath: o.svgPath,
          }))}
          unidades={unidades}
        />
      </div>
    </div>
  );
}
