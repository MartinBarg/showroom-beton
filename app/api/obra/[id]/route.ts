import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiRol } from "@/lib/api-guard";

const esquema = z.object({
  titulo: z.string().min(2).max(200).optional(),
  descripcion: z.string().min(2).max(5000).optional(),
  imagenes: z.array(z.string().url()).optional(),
  fechaPublicacion: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireApiRol(["DESARROLLADOR", "OWNER"]);
  if (guard.error) return guard.error;

  const body = await req.json().catch(() => null);
  const datos = esquema.safeParse(body);
  if (!datos.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const existente = await prisma.avanceObra.findUnique({ where: { id: params.id } });
  if (!existente) return NextResponse.json({ error: "Avance no encontrado" }, { status: 404 });

  const avance = await prisma.avanceObra.update({
    where: { id: params.id },
    data: {
      ...(datos.data.titulo !== undefined && { titulo: datos.data.titulo }),
      ...(datos.data.descripcion !== undefined && { descripcion: datos.data.descripcion }),
      ...(datos.data.imagenes !== undefined && {
        imagenes: JSON.stringify(datos.data.imagenes),
      }),
      ...(datos.data.fechaPublicacion !== undefined && {
        fechaPublicacion: new Date(`${datos.data.fechaPublicacion}T12:00:00Z`),
      }),
    },
  });

  return NextResponse.json({ ok: true, avance });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const guard = await requireApiRol(["DESARROLLADOR", "OWNER"]);
  if (guard.error) return guard.error;

  const existente = await prisma.avanceObra.findUnique({ where: { id: params.id } });
  if (!existente) return NextResponse.json({ error: "Avance no encontrado" }, { status: 404 });

  await prisma.avanceObra.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
