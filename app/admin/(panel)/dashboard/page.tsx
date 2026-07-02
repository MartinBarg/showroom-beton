import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import {
  comparativaAgencias,
  kpisAgencia,
  kpisUnidades,
  rankingUnidadesVisitadas,
  resumenComisionesPorAgencia,
  totalVisitas,
  ventasEnElTiempo,
  ventasPorTipologia,
} from "@/lib/metrics";
import { formatearPrecio } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GraficoVentasTiempo, GraficoVentasTipologia } from "@/components/admin/charts";
import { KanbanLeads } from "@/components/admin/kanban-leads";

export const metadata = { title: "Dashboard" };

function Kpi({ etiqueta, valor }: { etiqueta: string; valor: string | number }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{etiqueta}</p>
        <p className="mt-1 text-3xl font-semibold">{valor}</p>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.user) redirect("/admin/login");
  const { rol, agenciaId } = session.user;

  if (rol === "AGENCIA" && agenciaId) {
    return <DashboardAgencia agenciaId={agenciaId} />;
  }
  return <DashboardDesarrollador />;
}

async function DashboardDesarrollador() {
  const [unidades, visitas, comisiones, agencias, leads] = await Promise.all([
    prisma.unidad.findMany({
      select: { id: true, numero: true, tipologia: true, estado: true, agenciaId: true },
    }),
    prisma.visita.findMany({ select: { unidadId: true } }),
    prisma.comision.findMany(),
    prisma.agencia.findMany({ orderBy: { nombre: "asc" } }),
    prisma.lead.findMany({
      include: {
        unidad: { select: { numero: true } },
        agencia: { select: { nombre: true } },
      },
      orderBy: { creadoEn: "desc" },
    }),
  ]);

  const kpis = kpisUnidades(unidades);
  const ranking = rankingUnidadesVisitadas(visitas, unidades, 5);
  const comisionesPorAgencia = resumenComisionesPorAgencia(comisiones, agencias);
  const comparativa = comparativaAgencias(
    agencias,
    leads.map((l) => ({ agenciaId: l.agenciaId, estado: l.estado })),
    unidades,
    comisiones
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visión general del proyecto.</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Kpi etiqueta="Total unidades" valor={kpis.total} />
        <Kpi etiqueta="Disponibles" valor={kpis.disponibles} />
        <Kpi etiqueta="Reservadas" valor={kpis.reservadas} />
        <Kpi etiqueta="Vendidas" valor={kpis.vendidas} />
        <Kpi etiqueta="Visitas totales" valor={totalVisitas(visitas)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Ranking de unidades más visitadas */}
        <Card>
          <CardHeader>
            <CardTitle>Unidades más visitadas</CardTitle>
          </CardHeader>
          <CardContent>
            {ranking.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin visitas registradas.</p>
            ) : (
              <ol className="space-y-2.5">
                {ranking.map((item, i) => (
                  <li key={item.unidadId} className="flex items-center gap-3 text-sm">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
                      {i + 1}
                    </span>
                    <span className="font-medium">Unidad {item.numero}</span>
                    <span className="capitalize text-muted-foreground">{item.tipologia}</span>
                    <span className="ml-auto text-muted-foreground">
                      {item.visitas} visitas
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        {/* Comisiones por agencia */}
        <Card>
          <CardHeader>
            <CardTitle>Comisiones por agencia</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agencia</TableHead>
                  <TableHead className="text-right">Pagado</TableHead>
                  <TableHead className="text-right">Pendiente</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comisionesPorAgencia.map((fila) => (
                  <TableRow key={fila.agenciaId}>
                    <TableCell className="font-medium">{fila.nombre}</TableCell>
                    <TableCell className="text-right text-emerald-700">
                      {formatearPrecio(fila.pagado)}
                    </TableCell>
                    <TableCell className="text-right text-amber-700">
                      {formatearPrecio(fila.pendiente)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatearPrecio(fila.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ventas por tipología</CardTitle>
          </CardHeader>
          <CardContent>
            <GraficoVentasTipologia data={ventasPorTipologia(unidades)} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ventas en el tiempo</CardTitle>
          </CardHeader>
          <CardContent>
            <GraficoVentasTiempo data={ventasEnElTiempo(comisiones)} />
          </CardContent>
        </Card>
      </div>

      {/* Comparativa por agencia */}
      <Card>
        <CardHeader>
          <CardTitle>Comparativa por agencia</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agencia</TableHead>
                <TableHead className="text-right">Leads</TableHead>
                <TableHead className="text-right">Won</TableHead>
                <TableHead className="text-right">Reservadas</TableHead>
                <TableHead className="text-right">Vendidas</TableHead>
                <TableHead className="text-right">Comisión total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparativa.map((fila) => (
                <TableRow key={fila.agenciaId}>
                  <TableCell className="font-medium">{fila.nombre}</TableCell>
                  <TableCell className="text-right">{fila.leads}</TableCell>
                  <TableCell className="text-right">{fila.won}</TableCell>
                  <TableCell className="text-right">{fila.reservadas}</TableCell>
                  <TableCell className="text-right">{fila.vendidas}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatearPrecio(fila.comisionTotal)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Kanban de leads */}
      <div>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Leads</h2>
          <Link href="/admin/leads" className="text-sm text-muted-foreground hover:underline">
            Ver página completa →
          </Link>
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
          puedeAsignar
        />
      </div>
    </div>
  );
}

async function DashboardAgencia({ agenciaId }: { agenciaId: string }) {
  const [agencia, leads, comisiones] = await Promise.all([
    prisma.agencia.findUnique({ where: { id: agenciaId } }),
    prisma.lead.findMany({
      where: { agenciaId },
      include: {
        unidad: { select: { numero: true } },
        agencia: { select: { nombre: true } },
      },
      orderBy: { creadoEn: "desc" },
    }),
    prisma.comision.findMany({ where: { agenciaId } }),
  ]);

  const kpis = kpisAgencia(
    agenciaId,
    leads.map((l) => ({ agenciaId: l.agenciaId, estado: l.estado })),
    comisiones
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard — {agencia?.nombre}</h1>
        <p className="text-sm text-muted-foreground">
          Tus leads y comisiones en el proyecto.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi etiqueta="Leads activos" valor={kpis.leadsActivos} />
        <Kpi etiqueta="Ventas (Won)" valor={kpis.won} />
        <Kpi etiqueta="Comisión cobrada" valor={formatearPrecio(kpis.comisionCobrada)} />
        <Kpi etiqueta="Comisión pendiente" valor={formatearPrecio(kpis.comisionPendiente)} />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Mis leads</h2>
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
          agencias={[]}
          puedeAsignar={false}
        />
      </div>
    </div>
  );
}
