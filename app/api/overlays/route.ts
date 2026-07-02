import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiRol } from "@/lib/api-guard";

const esquema = z.object({
  unidadId: z.string(),
  vistaExteriorId: z.string(),
  svgPath: z.string().min(5).max(10000),
});

export async function POST(req: Request) {
  const guard = await requireApiRol(["OWNER"]);
  if (guard.error) return guard.error;

  const body = await req.json().catch(() => null);
  const datos = esquema.safeParse(body);
  if (!datos.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const [unidad, vista] = await Promise.all([
    prisma.unidad.findUnique({ where: { id: datos.data.unidadId } }),
    prisma.vistaExterior.findUnique({ where: { id: datos.data.vistaExteriorId } }),
  ]);
  if (!unidad) return NextResponse.json({ error: "Unidad inexistente" }, { status: 400 });
  if (!vista) return NextResponse.json({ error: "Vista inexistente" }, { status: 400 });

  const overlay = await prisma.unidadOverlay.create({ data: datos.data });
  return NextResponse.json({ ok: true, overlay }, { status: 201 });
}
