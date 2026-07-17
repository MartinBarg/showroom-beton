import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FichaUnidadShell } from "@/components/public/ficha-unidad-shell";
import { VisitaTracker } from "@/components/public/visita-tracker";

export default async function UnidadLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const unidad = await prisma.unidad.findUnique({
    where: { id: params.id },
    include: { piso: { select: { numero: true } } },
  });
  if (!unidad) notFound();

  return (
    <main>
      <VisitaTracker unidadId={unidad.id} />
      <FichaUnidadShell
        unidad={{
          id: unidad.id,
          numero: unidad.numero,
          tipologia: unidad.tipologia,
          superficieTotal: unidad.superficieTotal,
          superficieCubierta: unidad.superficieCubierta,
          superficieDescubierta: unidad.superficieDescubierta,
          orientacion: unidad.orientacion,
          precio: unidad.precio,
          estado: unidad.estado,
          renderUrl: unidad.renderUrl,
          descripcion: unidad.descripcion,
          pisoNumero: unidad.piso.numero,
          esLocalComercial: unidad.esLocalComercial,
        }}
        basePath={`/proyecto/unidad/${unidad.id}`}
      >
        {children}
      </FichaUnidadShell>
    </main>
  );
}
