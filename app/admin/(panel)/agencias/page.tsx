import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { comparativaAgencias } from "@/lib/metrics";
import { TablaAgencias } from "@/components/admin/tabla-agencias";
import { buttonVariants } from "@/components/ui/button";

export const metadata = { title: "Agencias" };

export default async function AgenciasAdminPage() {
  const [agencias, leads, unidades, comisiones] = await Promise.all([
    prisma.agencia.findMany({
      include: { usuarios: { select: { email: true } } },
      orderBy: { nombre: "asc" },
    }),
    prisma.lead.findMany({ select: { agenciaId: true, estado: true } }),
    prisma.unidad.findMany({
      select: { id: true, numero: true, tipologia: true, estado: true, agenciaId: true },
    }),
    prisma.comision.findMany(),
  ]);

  const metricas = comparativaAgencias(agencias, leads, unidades, comisiones);
  const porAgencia = new Map(metricas.map((m) => [m.agenciaId, m]));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Agencias</h1>
          <p className="text-sm text-muted-foreground">
            Agencias inmobiliarias con acceso al panel y sus métricas.
          </p>
        </div>
        <Link
          href="/admin/agencias/nueva"
          className={buttonVariants({ variant: "default" })}
        >
          <Plus className="h-4 w-4" /> Nueva agencia
        </Link>
      </div>

      <TablaAgencias
        agencias={agencias.map((a) => {
          const m = porAgencia.get(a.id);
          return {
            id: a.id,
            nombre: a.nombre,
            email: a.email,
            telefono: a.telefono,
            activa: a.activa,
            cuentas: a.usuarios.map((u) => u.email),
            leads: m?.leads ?? 0,
            won: m?.won ?? 0,
            vendidas: m?.vendidas ?? 0,
            reservadas: m?.reservadas ?? 0,
            comisionTotal: m?.comisionTotal ?? 0,
          };
        })}
      />
    </div>
  );
}
