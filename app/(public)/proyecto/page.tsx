import { prisma } from "@/lib/prisma";
import { FachadaInteractiva } from "@/components/public/fachada-interactiva";
import { VisitaTracker } from "@/components/public/visita-tracker";

export const metadata = { title: "Proyecto" };

export default async function ProyectoPage() {
  const proyecto = await prisma.proyecto.findFirst({ where: { activo: true } });
  if (!proyecto) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-stone-400">No hay un proyecto activo cargado todavía.</p>
      </main>
    );
  }

  const [vistas, transiciones, unidades] = await Promise.all([
    prisma.vistaExterior.findMany({
      where: { proyectoId: proyecto.id },
      orderBy: { orden: "asc" },
      include: { overlays: { select: { unidadId: true, svgPath: true } } },
    }),
    prisma.transicionVista.findMany({
      where: { vistaOrigen: { proyectoId: proyecto.id } },
      select: { vistaOrigenId: true, vistaDestinoId: true, videoUrl: true },
    }),
    prisma.unidad.findMany({
      where: { piso: { proyectoId: proyecto.id } },
      select: {
        id: true,
        numero: true,
        tipologia: true,
        superficieTotal: true,
        estado: true,
        esLocalComercial: true,
      },
    }),
  ]);

  return (
    <main>
      <VisitaTracker />
      <FachadaInteractiva
        vistas={vistas.map((v) => ({
          id: v.id,
          nombre: v.nombre,
          imagenUrl: v.imagenUrl,
          esVistaInicial: v.esVistaInicial,
          overlays: v.overlays,
        }))}
        transiciones={transiciones}
        unidades={unidades}
      />
    </main>
  );
}
