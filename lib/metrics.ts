// Cálculo de métricas y comisiones de los dashboards. Funciones puras sobre
// tipos planos para poder testearlas sin base de datos.
import type { EstadoLead } from "./types";

export type UnidadMetrica = {
  id: string;
  numero: string;
  tipologia: string;
  estado: string;
  agenciaId: string | null;
};

export type ComisionMetrica = {
  agenciaId: string;
  monto: number;
  estado: string; // pendiente | pagada
  fechaPago: Date | null;
  creadoEn: Date;
};

export type VisitaMetrica = { unidadId: string | null };

export type LeadMetrica = { agenciaId: string | null; estado: string };

export type AgenciaMetrica = { id: string; nombre: string };

// KPIs de unidades del dashboard DESARROLLADOR
export function kpisUnidades(unidades: Pick<UnidadMetrica, "estado">[]) {
  return {
    total: unidades.length,
    disponibles: unidades.filter((u) => u.estado === "disponible").length,
    reservadas: unidades.filter((u) => u.estado === "reservada").length,
    vendidas: unidades.filter((u) => u.estado === "vendida").length,
  };
}

export function totalVisitas(visitas: VisitaMetrica[]): number {
  return visitas.length;
}

// Ranking de unidades más visitadas (ignora visitas generales sin unidad)
export function rankingUnidadesVisitadas(
  visitas: VisitaMetrica[],
  unidades: UnidadMetrica[],
  top = 5
): Array<{ unidadId: string; numero: string; tipologia: string; visitas: number }> {
  const conteo = new Map<string, number>();
  for (const v of visitas) {
    if (!v.unidadId) continue;
    conteo.set(v.unidadId, (conteo.get(v.unidadId) ?? 0) + 1);
  }
  const porId = new Map(unidades.map((u) => [u.id, u]));
  return [...conteo.entries()]
    .map(([unidadId, cantidad]) => {
      const unidad = porId.get(unidadId);
      return unidad
        ? { unidadId, numero: unidad.numero, tipologia: unidad.tipologia, visitas: cantidad }
        : null;
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .sort((a, b) => b.visitas - a.visitas || a.numero.localeCompare(b.numero))
    .slice(0, top);
}

// Resumen de comisiones por agencia: cuánto se pagó y cuánto está pendiente
export function resumenComisionesPorAgencia(
  comisiones: ComisionMetrica[],
  agencias: AgenciaMetrica[]
): Array<{ agenciaId: string; nombre: string; pagado: number; pendiente: number; total: number }> {
  return agencias.map((agencia) => {
    const propias = comisiones.filter((c) => c.agenciaId === agencia.id);
    const pagado = propias
      .filter((c) => c.estado === "pagada")
      .reduce((suma, c) => suma + c.monto, 0);
    const pendiente = propias
      .filter((c) => c.estado === "pendiente")
      .reduce((suma, c) => suma + c.monto, 0);
    return { agenciaId: agencia.id, nombre: agencia.nombre, pagado, pendiente, total: pagado + pendiente };
  });
}

// Tabla comparativa por agencia del dashboard DESARROLLADOR
export function comparativaAgencias(
  agencias: AgenciaMetrica[],
  leads: LeadMetrica[],
  unidades: UnidadMetrica[],
  comisiones: ComisionMetrica[]
): Array<{
  agenciaId: string;
  nombre: string;
  leads: number;
  won: number;
  reservadas: number;
  vendidas: number;
  comisionTotal: number;
}> {
  return agencias.map((agencia) => {
    const leadsPropios = leads.filter((l) => l.agenciaId === agencia.id);
    const unidadesPropias = unidades.filter((u) => u.agenciaId === agencia.id);
    return {
      agenciaId: agencia.id,
      nombre: agencia.nombre,
      leads: leadsPropios.length,
      won: leadsPropios.filter((l) => l.estado === "Won").length,
      reservadas: unidadesPropias.filter((u) => u.estado === "reservada").length,
      vendidas: unidadesPropias.filter((u) => u.estado === "vendida").length,
      comisionTotal: comisiones
        .filter((c) => c.agenciaId === agencia.id)
        .reduce((suma, c) => suma + c.monto, 0),
    };
  });
}

// Gráfico de ventas por tipología (unidades vendidas)
export function ventasPorTipologia(
  unidades: Pick<UnidadMetrica, "tipologia" | "estado">[]
): Array<{ tipologia: string; vendidas: number }> {
  const conteo = new Map<string, number>();
  for (const u of unidades) {
    if (u.estado !== "vendida") continue;
    conteo.set(u.tipologia, (conteo.get(u.tipologia) ?? 0) + 1);
  }
  return [...conteo.entries()]
    .map(([tipologia, vendidas]) => ({ tipologia, vendidas }))
    .sort((a, b) => a.tipologia.localeCompare(b.tipologia));
}

// Gráfico de ventas en el tiempo. Como el modelo no guarda fecha de venta por
// unidad, se usan las comisiones como registro temporal de las operaciones
// (fechaPago si existe, si no creadoEn). Documentado en NOTAS-PARA-REVISION.md.
export function ventasEnElTiempo(
  comisiones: ComisionMetrica[]
): Array<{ mes: string; operaciones: number; monto: number }> {
  const porMes = new Map<string, { operaciones: number; monto: number }>();
  for (const c of comisiones) {
    const fecha = c.fechaPago ?? c.creadoEn;
    const mes = `${fecha.getUTCFullYear()}-${String(fecha.getUTCMonth() + 1).padStart(2, "0")}`;
    const actual = porMes.get(mes) ?? { operaciones: 0, monto: 0 };
    actual.operaciones += 1;
    actual.monto += c.monto;
    porMes.set(mes, actual);
  }
  return [...porMes.entries()]
    .map(([mes, datos]) => ({ mes, ...datos }))
    .sort((a, b) => a.mes.localeCompare(b.mes));
}

// KPIs del dashboard AGENCIA
export function kpisAgencia(
  agenciaId: string,
  leads: LeadMetrica[],
  comisiones: ComisionMetrica[]
) {
  const propios = leads.filter((l) => l.agenciaId === agenciaId);
  const propiasComisiones = comisiones.filter((c) => c.agenciaId === agenciaId);
  return {
    leadsActivos: propios.filter((l) => l.estado !== "Won" && l.estado !== "Lost").length,
    won: propios.filter((l) => l.estado === "Won").length,
    comisionCobrada: propiasComisiones
      .filter((c) => c.estado === "pagada")
      .reduce((suma, c) => suma + c.monto, 0),
    comisionPendiente: propiasComisiones
      .filter((c) => c.estado === "pendiente")
      .reduce((suma, c) => suma + c.monto, 0),
  };
}

// Agrupa leads por columna del kanban preservando el orden de las columnas
export function agruparPorEstado<T extends { estado: string }>(
  leads: T[],
  estados: readonly string[]
): Record<string, T[]> {
  const grupos: Record<string, T[]> = {};
  for (const estado of estados) grupos[estado] = [];
  for (const lead of leads) {
    if (grupos[lead.estado]) grupos[lead.estado].push(lead);
  }
  return grupos;
}

export type { EstadoLead };
