// Script de una sola corrida: carga los valores reales de superficies y
// ambientes en las unidades ya existentes (creadas antes de estos campos).
// Correr con: npx tsx scripts/actualizar-datos-reales-unidades.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Datos = {
  supTotal: number;
  supCubierta: number;
  supMuro: number;
  supDescubierta: number;
  tipologia: string;
  dormitorios: number;
  banos: number;
  balcon: boolean;
  pileta: boolean;
  solarium: boolean;
  jardin: boolean;
  terraza: boolean;
};

const datosPorNumero: Record<string, Datos> = {
  "001": { supTotal: 418.67, supCubierta: 194.4, supMuro: 20.22, supDescubierta: 204.05, tipologia: "3 ambientes", dormitorios: 4, banos: 5, balcon: true, pileta: true, solarium: true, jardin: true, terraza: false },
  "002": { supTotal: 226.48, supCubierta: 131.74, supMuro: 16.26, supDescubierta: 78.48, tipologia: "3 ambientes", dormitorios: 3, banos: 4, balcon: true, pileta: true, solarium: true, jardin: true, terraza: false },
  "101": { supTotal: 113.31, supCubierta: 90.15, supMuro: 6.43, supDescubierta: 16.73, tipologia: "2 ambientes", dormitorios: 2, banos: 3, balcon: true, pileta: false, solarium: false, jardin: false, terraza: false },
  "201": { supTotal: 113.31, supCubierta: 90.15, supMuro: 6.43, supDescubierta: 16.73, tipologia: "2 ambientes", dormitorios: 2, banos: 3, balcon: true, pileta: false, solarium: false, jardin: false, terraza: false },
  "301": { supTotal: 113.31, supCubierta: 90.15, supMuro: 6.43, supDescubierta: 16.73, tipologia: "2 ambientes", dormitorios: 2, banos: 3, balcon: true, pileta: false, solarium: false, jardin: false, terraza: false },
  "102": { supTotal: 88.81, supCubierta: 69.38, supMuro: 4.48, supDescubierta: 14.95, tipologia: "2 ambientes", dormitorios: 2, banos: 2, balcon: true, pileta: false, solarium: false, jardin: false, terraza: false },
  "202": { supTotal: 88.81, supCubierta: 69.38, supMuro: 4.48, supDescubierta: 14.95, tipologia: "2 ambientes", dormitorios: 2, banos: 2, balcon: true, pileta: false, solarium: false, jardin: false, terraza: false },
  "302": { supTotal: 84.4, supCubierta: 69.38, supMuro: 4.3, supDescubierta: 10.34, tipologia: "2 ambientes", dormitorios: 2, banos: 2, balcon: true, pileta: false, solarium: false, jardin: false, terraza: false },
  "203": { supTotal: 195.56, supCubierta: 157.7, supMuro: 9.01, supDescubierta: 28.85, tipologia: "3 ambientes", dormitorios: 3, banos: 4, balcon: true, pileta: false, solarium: false, jardin: false, terraza: false },
  "401": { supTotal: 307.68, supCubierta: 127.12, supMuro: 17.62, supDescubierta: 162.94, tipologia: "3 ambientes", dormitorios: 3, banos: 4, balcon: true, pileta: true, solarium: true, jardin: false, terraza: true },
  "404": { supTotal: 298.85, supCubierta: 173.03, supMuro: 20.57, supDescubierta: 105.25, tipologia: "3 ambientes", dormitorios: 3, banos: 5, balcon: true, pileta: true, solarium: true, jardin: false, terraza: true },
  "LC-1": { supTotal: 103.15, supCubierta: 89.88, supMuro: 5.8, supDescubierta: 7.47, tipologia: "local", dormitorios: 0, banos: 1, balcon: false, pileta: false, solarium: false, jardin: true, terraza: false },
};

async function main() {
  for (const [numero, d] of Object.entries(datosPorNumero)) {
    const unidad = await prisma.unidad.findFirst({ where: { numero } });
    if (!unidad) {
      console.warn(`[skip] No existe la unidad ${numero} en la base local.`);
      continue;
    }
    await prisma.unidad.update({
      where: { id: unidad.id },
      data: {
        superficieTotal: d.supTotal,
        superficieCubierta: d.supCubierta,
        superficieMuro: d.supMuro,
        superficieDescubierta: d.supDescubierta,
        tipologia: d.tipologia,
        dormitorios: d.dormitorios,
        banos: d.banos,
        balcon: d.balcon,
        pileta: d.pileta,
        solarium: d.solarium,
        jardin: d.jardin,
        terraza: d.terraza,
      },
    });
    console.log(`[ok] Unidad ${numero} actualizada.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
