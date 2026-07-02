import { prisma } from "@/lib/prisma";
import { FichaUnidadShell } from "@/components/public/ficha-unidad-shell";
import { VisitaTracker } from "@/components/public/visita-tracker";

export const metadata = { title: "Local comercial" };

export default async function LocalComercialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const local = await prisma.unidad.findFirst({
    where: { esLocalComercial: true },
    include: { piso: { select: { numero: true } } },
  });

  if (!local) {
    return (
      <main className="flex min-h-screen items-center justify-center pt-16">
        <p className="text-stone-400">El local comercial todavía no está cargado.</p>
      </main>
    );
  }

  return (
    <main className="pt-16">
      <VisitaTracker unidadId={local.id} />
      <FichaUnidadShell
        unidad={{
          id: local.id,
          numero: local.numero,
          tipologia: local.tipologia,
          superficieTotal: local.superficieTotal,
          superficieCubierta: local.superficieCubierta,
          superficieDescubierta: local.superficieDescubierta,
          orientacion: local.orientacion,
          precio: local.precio,
          estado: local.estado,
          renderUrl: local.renderUrl,
          descripcion: local.descripcion,
          pisoNumero: local.piso.numero,
          esLocalComercial: true,
        }}
        basePath="/local-comercial"
        extra={
          <div className="mt-5 border-t border-white/10 pt-4 text-sm leading-relaxed text-stone-300">
            <p className="font-medium text-amber-300">Una esquina con potencial</p>
            <p className="mt-2">
              Ubicado a metros de Av. Cabildo, el local combina vidriera de gran
              desarrollo con una zona de alto tránsito peatonal. Ideal para
              gastronomía, retail o servicios premium. Texto placeholder — editar
              desde el panel interno.
            </p>
          </div>
        }
      >
        {children}
      </FichaUnidadShell>
    </main>
  );
}
