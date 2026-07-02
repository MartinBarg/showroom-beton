import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiRol } from "@/lib/api-guard";
import { ESTADOS_UNIDAD, TIPOLOGIAS } from "@/lib/types";

const esquema = z.object({
  pisoId: z.string(),
  numero: z.string().min(1).max(20),
  tipologia: z.enum(TIPOLOGIAS),
  superficieTotal: z.number().positive(),
  superficieCubierta: z.number().min(0),
  superficieDescubierta: z.number().min(0),
  orientacion: z.string().min(1).max(40),
  precio: z.number().min(0),
  estado: z.enum(ESTADOS_UNIDAD).default("disponible"),
  esLocalComercial: z.boolean().default(false),
  destacada: z.boolean().default(false),
  renderUrl: z.string().url().nullable().optional(),
  planoUrl: z.string().url().nullable().optional(),
  galeria: z.array(z.string().url()).default([]),
  tourKuulaUrl: z.string().url().nullable().optional(),
  descripcion: z.string().max(3000).nullable().optional(),
});

// Alta de unidades: solo el OWNER desde el panel interno
export async function POST(req: Request) {
  const guard = await requireApiRol(["OWNER"]);
  if (guard.error) return guard.error;

  const body = await req.json().catch(() => null);
  const datos = esquema.safeParse(body);
  if (!datos.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const piso = await prisma.piso.findUnique({ where: { id: datos.data.pisoId } });
  if (!piso) return NextResponse.json({ error: "Piso inexistente" }, { status: 400 });

  const { galeria, ...resto } = datos.data;
  const unidad = await prisma.unidad.create({
    data: {
      ...resto,
      renderUrl: resto.renderUrl ?? null,
      planoUrl: resto.planoUrl ?? null,
      tourKuulaUrl: resto.tourKuulaUrl ?? null,
      descripcion: resto.descripcion ?? null,
      galeria: JSON.stringify(galeria),
    },
  });

  return NextResponse.json({ ok: true, unidad }, { status: 201 });
}
