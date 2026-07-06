import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { KanbanLeads } from "@/components/admin/kanban-leads";

export const metadata = { title: "Leads" };

export default async function LeadsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/admin/login");
  const { rol, agenciaId } = session.user;

  const esAgencia = rol === "AGENCIA";
  const [leads, agencias] = await Promise.all([
    prisma.lead.findMany({
      where: esAgencia ? { agenciaId } : undefined,
      include: {
        unidad: { select: { numero: true } },
        agencia: { select: { nombre: true } },
      },
      orderBy: { creadoEn: "desc" },
    }),
    esAgencia
      ? Promise.resolve([])
      : prisma.agencia.findMany({ where: { activa: true }, orderBy: { nombre: "asc" } }),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Leads</h1>
        <p className="text-sm text-muted-foreground">
          Arrastrá las tarjetas entre columnas para actualizar el estado.
          {rol !== "AGENCIA" && " Hacé click en una tarjeta para asignar agencia."}
        </p>
      </div>
      <KanbanLeads
        leadsIniciales={leads.map((l) => ({
          id: l.id,
          nombre: l.nombre,
          email: l.email,
          telefono: l.telefono,
          mensaje: l.mensaje,
          estado: l.estado,
          unidadNumero: l.unidad?.numero ?? null,
          agenciaId: l.agenciaId,
          agenciaNombre: l.agencia?.nombre ?? null,
          creadoEn: l.creadoEn.toISOString(),
        }))}
        agencias={agencias.map((a) => ({ id: a.id, nombre: a.nombre }))}
        puedeAsignar={rol !== "AGENCIA"}
      />
    </div>
  );
}
