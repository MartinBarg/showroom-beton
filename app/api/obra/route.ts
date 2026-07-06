import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiRol } from "@/lib/api-guard";

const esquemaAvance = z.object({
  titulo: z.string().min(2).max(200),
  descripcion: z.string().min(2).max(5000),
  imagenes: z.array(z.string().url()).default([]),
  fechaPublicacion: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function POST(req: Request) {
  const guard = await requireApiRol(["DESARROLLADOR", "OWNER"]);
  if (guard.error) return guard.error;

  const body = await req.json().catch(() => null);
  const datos = esquemaAvance.safeParse(body);
  if (!datos.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const proyecto = await prisma.proyecto.findFirst({ where: { activo: true } });
  if (!proyecto) {
    return NextResponse.json({ error: "No hay proyecto activo" }, { status: 400 });
  }

  const avance = await prisma.avanceObra.create({
    data: {
      proyectoId: proyecto.id,
      titulo: datos.data.titulo,
      descripcion: datos.data.descripcion,
      imagenes: JSON.stringify(datos.data.imagenes),
      fechaPublicacion: new Date(`${datos.data.fechaPublicacion}T12:00:00Z`),
    },
  });

  return NextResponse.json({ ok: true, avance }, { status: 201 });
}
