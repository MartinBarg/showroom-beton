import { describe, expect, it } from "vitest";
import {
  agruparPorEstado,
  comparativaAgencias,
  kpisAgencia,
  kpisUnidades,
  rankingUnidadesVisitadas,
  resumenComisionesPorAgencia,
  totalVisitas,
  ventasEnElTiempo,
  ventasPorTipologia,
} from "@/lib/metrics";
import { ESTADOS_LEAD } from "@/lib/types";

const unidades = [
  { id: "u1", numero: "101", tipologia: "1 ambiente", estado: "disponible", agenciaId: null },
  { id: "u2", numero: "102", tipologia: "2 ambientes", estado: "reservada", agenciaId: "a1" },
  { id: "u3", numero: "104", tipologia: "3 ambientes", estado: "vendida", agenciaId: "a2" },
  { id: "u4", numero: "504", tipologia: "duplex", estado: "vendida", agenciaId: "a2" },
  { id: "u5", numero: "301", tipologia: "1 ambiente", estado: "vendida", agenciaId: "a1" },
];

const agencias = [
  { id: "a1", nombre: "Norte" },
  { id: "a2", nombre: "Sur" },
];

const comisiones = [
  { agenciaId: "a1", monto: 1000, estado: "pagada", fechaPago: new Date("2026-03-10"), creadoEn: new Date("2026-03-01") },
  { agenciaId: "a1", monto: 500, estado: "pendiente", fechaPago: null, creadoEn: new Date("2026-04-02") },
  { agenciaId: "a2", monto: 2000, estado: "pagada", fechaPago: new Date("2026-04-20"), creadoEn: new Date("2026-04-01") },
  { agenciaId: "a2", monto: 750, estado: "pendiente", fechaPago: null, creadoEn: new Date("2026-04-15") },
];

describe("kpisUnidades", () => {
  it("cuenta total y por estado", () => {
    expect(kpisUnidades(unidades)).toEqual({
      total: 5,
      disponibles: 1,
      reservadas: 1,
      vendidas: 3,
    });
  });

  it("con lista vacía todo da cero", () => {
    expect(kpisUnidades([])).toEqual({ total: 0, disponibles: 0, reservadas: 0, vendidas: 0 });
  });
});

describe("rankingUnidadesVisitadas", () => {
  const visitas = [
    { unidadId: "u1" },
    { unidadId: "u1" },
    { unidadId: "u1" },
    { unidadId: "u2" },
    { unidadId: "u2" },
    { unidadId: "u3" },
    { unidadId: null },
    { unidadId: "inexistente" },
  ];

  it("ordena por cantidad de visitas descendente", () => {
    const ranking = rankingUnidadesVisitadas(visitas, unidades);
    expect(ranking.map((r) => r.numero)).toEqual(["101", "102", "104"]);
    expect(ranking[0].visitas).toBe(3);
  });

  it("ignora visitas generales y unidades inexistentes", () => {
    const ranking = rankingUnidadesVisitadas(visitas, unidades);
    expect(ranking).toHaveLength(3);
  });

  it("respeta el límite top", () => {
    expect(rankingUnidadesVisitadas(visitas, unidades, 2)).toHaveLength(2);
  });

  it("cuenta el total de visitas incluidas las generales", () => {
    expect(totalVisitas(visitas)).toBe(8);
  });
});

describe("resumenComisionesPorAgencia", () => {
  it("separa pagado de pendiente por agencia", () => {
    const resumen = resumenComisionesPorAgencia(comisiones, agencias);
    expect(resumen).toEqual([
      { agenciaId: "a1", nombre: "Norte", pagado: 1000, pendiente: 500, total: 1500 },
      { agenciaId: "a2", nombre: "Sur", pagado: 2000, pendiente: 750, total: 2750 },
    ]);
  });

  it("agencia sin comisiones da ceros", () => {
    const resumen = resumenComisionesPorAgencia([], agencias);
    expect(resumen[0]).toEqual({
      agenciaId: "a1",
      nombre: "Norte",
      pagado: 0,
      pendiente: 0,
      total: 0,
    });
  });
});

describe("comparativaAgencias", () => {
  const leads = [
    { agenciaId: "a1", estado: "Lead" },
    { agenciaId: "a1", estado: "Won" },
    { agenciaId: "a2", estado: "Won" },
    { agenciaId: "a2", estado: "Lost" },
    { agenciaId: null, estado: "Lead" },
  ];

  it("consolida leads, won, unidades y comisiones por agencia", () => {
    const filas = comparativaAgencias(agencias, leads, unidades, comisiones);
    expect(filas).toEqual([
      {
        agenciaId: "a1",
        nombre: "Norte",
        leads: 2,
        won: 1,
        reservadas: 1,
        vendidas: 1,
        comisionTotal: 1500,
      },
      {
        agenciaId: "a2",
        nombre: "Sur",
        leads: 2,
        won: 1,
        reservadas: 0,
        vendidas: 2,
        comisionTotal: 2750,
      },
    ]);
  });
});

describe("ventasPorTipologia", () => {
  it("solo cuenta unidades vendidas, agrupadas por tipología", () => {
    expect(ventasPorTipologia(unidades)).toEqual([
      { tipologia: "1 ambiente", vendidas: 1 },
      { tipologia: "3 ambientes", vendidas: 1 },
      { tipologia: "duplex", vendidas: 1 },
    ]);
  });
});

describe("ventasEnElTiempo", () => {
  it("agrupa por mes usando fechaPago y cae a creadoEn si no hay pago", () => {
    const serie = ventasEnElTiempo(comisiones);
    expect(serie).toEqual([
      { mes: "2026-03", operaciones: 1, monto: 1000 },
      { mes: "2026-04", operaciones: 3, monto: 3250 },
    ]);
  });
});

describe("kpisAgencia", () => {
  const leads = [
    { agenciaId: "a1", estado: "Lead" },
    { agenciaId: "a1", estado: "Seguimiento" },
    { agenciaId: "a1", estado: "Won" },
    { agenciaId: "a1", estado: "Lost" },
    { agenciaId: "a2", estado: "Won" },
  ];

  it("calcula KPIs propios sin mezclar datos de otra agencia", () => {
    expect(kpisAgencia("a1", leads, comisiones)).toEqual({
      leadsActivos: 2,
      won: 1,
      comisionCobrada: 1000,
      comisionPendiente: 500,
    });
  });
});

describe("agruparPorEstado", () => {
  it("genera todas las columnas del kanban aunque estén vacías", () => {
    const grupos = agruparPorEstado(
      [
        { estado: "Lead", id: 1 },
        { estado: "Won", id: 2 },
        { estado: "EstadoInvalido", id: 3 },
      ],
      ESTADOS_LEAD
    );
    expect(Object.keys(grupos)).toEqual([...ESTADOS_LEAD]);
    expect(grupos.Lead).toHaveLength(1);
    expect(grupos.Won).toHaveLength(1);
    // Estados desconocidos se descartan en vez de romper el tablero
    expect(Object.values(grupos).flat()).toHaveLength(2);
  });
});
