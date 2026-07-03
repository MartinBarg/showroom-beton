import { prisma } from "@/lib/prisma";
import { GestionVistas } from "@/components/panel/gestion-vistas";

export default async function PanelVistasPage() {
  const [vistas, transiciones] = await Promise.all([
    prisma.vistaExterior.findMany({
      orderBy: { orden: "asc" },
      include: {
        overlays: { include: { unidad: { select: { numero: true } } } },
      },
    }),
    prisma.transicionVista.findMany(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Vistas exteriores</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Imágenes de fachada, overlays SVG clickeables y videos de transición entre
        vistas. Sin video, el showroom hace un crossfade CSS.
      </p>
      <div className="mt-6">
        <GestionVistas
          vistas={vistas.map((v) => ({
            id: v.id,
            nombre: v.nombre,
            imagenUrl: v.imagenUrl,
            orden: v.orden,
            esVistaInicial: v.esVistaInicial,
            overlays: v.overlays.map((o) => ({
              id: o.id,
              unidadNumero: o.unidad.numero,
              svgPath: o.svgPath,
            })),
          }))}
          transiciones={transiciones.map((t) => ({
            id: t.id,
            vistaOrigenId: t.vistaOrigenId,
            vistaDestinoId: t.vistaDestinoId,
            videoUrl: t.videoUrl,
          }))}
        />
      </div>
    </div>
  );
}
