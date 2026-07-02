import { prisma } from "@/lib/prisma";
import { GestionPagos } from "@/components/admin/gestion-pagos";

export const metadata = { title: "Pagos y comisiones" };

export default async function PagosAdminPage() {
  const [comisiones, agencias, unidades] = await Promise.all([
    prisma.comision.findMany({
      include: {
        agencia: { select: { nombre: true } },
        unidad: { select: { numero: true } },
      },
      orderBy: { creadoEn: "desc" },
    }),
    prisma.agencia.findMany({ orderBy: { nombre: "asc" } }),
    prisma.unidad.findMany({
      select: { id: true, numero: true },
      orderBy: { numero: "asc" },
    }),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Pagos y comisiones</h1>
        <p className="text-sm text-muted-foreground">
          Registrá comisiones de agencias y marcá los pagos realizados.
        </p>
      </div>
      <GestionPagos
        comisionesIniciales={comisiones.map((c) => ({
          id: c.id,
          agenciaId: c.agenciaId,
          agenciaNombre: c.agencia.nombre,
          unidadNumero: c.unidad?.numero ?? null,
          concepto: c.concepto,
          monto: c.monto,
          estado: c.estado,
          fechaPago: c.fechaPago ? c.fechaPago.toISOString().slice(0, 10) : null,
        }))}
        agencias={agencias.map((a) => ({ id: a.id, nombre: a.nombre }))}
        unidades={unidades}
      />
    </div>
  );
}
