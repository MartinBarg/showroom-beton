import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiRol } from "@/lib/api-guard";

const esquema = z.object({
  nombre: z.string().min(2).max(120).optional(),
  imagenUrl: z.string().url().optional(),
  orden: z.number().int().min(0).max(100).optional(),
  esVistaInicial: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireApiRol(["OWNER"]);
  if (guard.error) return guard.error;

  const body = await req.json().catch(() => null);
  const datos = esquema.safeParse(body);
  if (!datos.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const existente = await prisma.vistaExterior.findUnique({ where: { id: params.id } });
  if (!existente) return NextResponse.json({ error: "Vista no encontrada" }, { status: 404 });

  // Solo puede haber una vista inicial por proyecto
  if (datos.data.esVistaInicial) {
    await prisma.vistaExterior.updateMany({
      where: { proyectoId: existente.proyectoId },
      data: { esVistaInicial: false },
    });
  }

  const vista = await prisma.vistaExterior.update({
    where: { id: params.id },
    data: datos.data,
  });

  return NextResponse.json({ ok: true, vista });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const guard = await requireApiRol(["OWNER"]);
  if (guard.error) return guard.error;

  const existente = await prisma.vistaExterior.findUnique({ where: { id: params.id } });
  if (!existente) return NextResponse.json({ error: "Vista no encontrada" }, { status: 404 });

  await prisma.vistaExterior.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
