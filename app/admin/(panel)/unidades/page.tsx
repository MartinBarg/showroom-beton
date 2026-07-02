import { prisma } from "@/lib/prisma";
import { TablaUnidades } from "@/components/admin/tabla-unidades";

export const metadata = { title: "Unidades" };

export default async function UnidadesAdminPage() {
  const [unidades, agencias] = await Promise.all([
    prisma.unidad.findMany({
      include: {
        piso: { select: { numero: true } },
        agencia: { select: { nombre: true } },
      },
      orderBy: [{ piso: { numero: "asc" } }, { numero: "asc" }],
    }),
    prisma.agencia.findMany({ where: { activa: true }, orderBy: { nombre: "asc" } }),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Unidades</h1>
        <p className="text-sm text-muted-foreground">
          Cambiá el estado directamente en la tabla. Al reservar o vender, asigná la
          agencia que hizo la operación.
        </p>
      </div>
      <TablaUnidades
        unidadesIniciales={unidades.map((u) => ({
          id: u.id,
          numero: u.numero,
          tipologia: u.tipologia,
          superficieTotal: u.superficieTotal,
          orientacion: u.orientacion,
          precio: u.precio,
          estado: u.estado,
          agenciaId: u.agenciaId,
          pisoNumero: u.piso.numero,
          esLocalComercial: u.esLocalComercial,
        }))}
        agencias={agencias.map((a) => ({ id: a.id, nombre: a.nombre }))}
      />
    </div>
  );
}
