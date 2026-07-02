import { prisma } from "@/lib/prisma";
import { CatalogoClient } from "@/components/public/catalogo-client";

export const metadata = { title: "Catálogo de unidades" };

export default async function CatalogoPage() {
  const unidades = await prisma.unidad.findMany({
    include: { piso: { select: { numero: true } } },
    orderBy: [{ piso: { numero: "asc" } }, { numero: "asc" }],
  });

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 pb-20 pt-28 sm:px-6">
      <h1 className="font-display text-4xl text-white">Catálogo de unidades</h1>
      <p className="mt-2 text-stone-400">
        Filtrá por tipología, superficie, orientación, estado o piso.
      </p>
      <CatalogoClient
        unidades={unidades.map((u) => ({
          id: u.id,
          numero: u.numero,
          tipologia: u.tipologia,
          superficieTotal: u.superficieTotal,
          orientacion: u.orientacion,
          estado: u.estado,
          precio: u.precio,
          pisoNumero: u.piso.numero,
          renderUrl: u.renderUrl,
          esLocalComercial: u.esLocalComercial,
          destacada: u.destacada,
        }))}
      />
    </main>
  );
}
