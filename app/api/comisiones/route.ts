import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiRol } from "@/lib/api-guard";

const esquema = z.object({
  agenciaId: z.string(),
  unidadId: z.string().nullable().optional(),
  concepto: z.string().min(2).max(300),
  monto: z.number().positive(),
});

export async function POST(req: Request) {
  const guard = await requireApiRol(["DESARROLLADOR", "OWNER"]);
  if (guard.error) return guard.error;

  const body = await req.json().catch(() => null);
  const datos = esquema.safeParse(body);
  if (!datos.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const agencia = await prisma.agencia.findUnique({ where: { id: datos.data.agenciaId } });
  if (!agencia) return NextResponse.json({ error: "Agencia inexistente" }, { status: 400 });

  if (datos.data.unidadId) {
    const unidad = await prisma.unidad.findUnique({ where: { id: datos.data.unidadId } });
    if (!unidad) return NextResponse.json({ error: "Unidad inexistente" }, { status: 400 });
  }

  const comision = await prisma.comision.create({
    data: {
      agenciaId: datos.data.agenciaId,
      unidadId: datos.data.unidadId ?? null,
      concepto: datos.data.concepto,
      monto: datos.data.monto,
      estado: "pendiente",
    },
  });

  return NextResponse.json({ ok: true, comision }, { status: 201 });
}
