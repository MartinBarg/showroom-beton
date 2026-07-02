import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const esquema = z.object({
  sessionId: z.string().min(8).max(100),
  unidadId: z.string().nullable().optional(),
});

// Público: registra una visita al showroom o a una unidad
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const datos = esquema.safeParse(body);
  if (!datos.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  let unidadId: string | null = datos.data.unidadId ?? null;
  if (unidadId) {
    const unidad = await prisma.unidad.findUnique({ where: { id: unidadId } });
    if (!unidad) unidadId = null;
  }

  await prisma.visita.create({
    data: { sessionId: datos.data.sessionId, unidadId },
  });
  return NextResponse.json({ ok: true });
}
