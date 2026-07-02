import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiRol } from "@/lib/api-guard";

const esquema = z.object({
  nombre: z.string().min(2).max(120),
  imagenUrl: z.string().url(),
  orden: z.number().int().min(0).max(100),
  esVistaInicial: z.boolean().default(false),
});

export async function POST(req: Request) {
  const guard = await requireApiRol(["OWNER"]);
  if (guard.error) return guard.error;

  const body = await req.json().catch(() => null);
  const datos = esquema.safeParse(body);
  if (!datos.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const proyecto = await prisma.proyecto.findFirst();
  if (!proyecto) {
    return NextResponse.json({ error: "No hay proyecto cargado" }, { status: 404 });
  }

  if (datos.data.esVistaInicial) {
    await prisma.vistaExterior.updateMany({
      where: { proyectoId: proyecto.id },
      data: { esVistaInicial: false },
    });
  }

  const vista = await prisma.vistaExterior.create({
    data: { ...datos.data, proyectoId: proyecto.id },
  });

  return NextResponse.json({ ok: true, vista }, { status: 201 });
}
