import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiRol } from "@/lib/api-guard";

const esquema = z.object({
  svgPath: z.string().min(5).max(10000),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireApiRol(["OWNER"]);
  if (guard.error) return guard.error;

  const body = await req.json().catch(() => null);
  const datos = esquema.safeParse(body);
  if (!datos.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const existente = await prisma.unidadOverlay.findUnique({ where: { id: params.id } });
  if (!existente) return NextResponse.json({ error: "Overlay no encontrado" }, { status: 404 });

  const overlay = await prisma.unidadOverlay.update({
    where: { id: params.id },
    data: datos.data,
  });
  return NextResponse.json({ ok: true, overlay });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const guard = await requireApiRol(["OWNER"]);
  if (guard.error) return guard.error;

  const existente = await prisma.unidadOverlay.findUnique({ where: { id: params.id } });
  if (!existente) return NextResponse.json({ error: "Overlay no encontrado" }, { status: 404 });

  await prisma.unidadOverlay.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
