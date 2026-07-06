import { prisma } from "@/lib/prisma";
import { parseJsonArray } from "@/lib/utils";
import { GestionUnidades } from "@/components/panel/gestion-unidades";

export const metadata = { title: "Contenido de unidades" };

export default async function ContenidoUnidadesPage() {
  const [pisos, agencias] = await Promise.all([
    prisma.piso.findMany({
      orderBy: { orden: "asc" },
      include: { unidades: { orderBy: { numero: "asc" } } },
    }),
    prisma.agencia.findMany({ orderBy: { nombre: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Contenido de unidades</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        CRUD completo del contenido de cada unidad: renders, planos, galería, tour
        360, precios y estados.
      </p>
      <div className="mt-6">
        <GestionUnidades
          pisos={pisos.map((p) => ({
            id: p.id,
            numero: p.numero,
            unidades: p.unidades.map((u) => ({
              id: u.id,
              numero: u.numero,
              tipologia: u.tipologia,
              superficieTotal: u.superficieTotal,
              superficieCubierta: u.superficieCubierta,
              superficieDescubierta: u.superficieDescubierta,
              orientacion: u.orientacion,
              precio: u.precio,
              estado: u.estado,
              agenciaId: u.agenciaId,
              esLocalComercial: u.esLocalComercial,
              destacada: u.destacada,
              renderUrl: u.renderUrl,
              planoUrl: u.planoUrl,
              galeria: parseJsonArray(u.galeria),
              tourKuulaUrl: u.tourKuulaUrl,
              descripcion: u.descripcion,
            })),
          }))}
          agencias={agencias.map((a) => ({ id: a.id, nombre: a.nombre }))}
        />
      </div>
    </div>
  );
}
