import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiRol } from "@/lib/api-guard";

const esquema = z.object({
  numero: z.number().int().min(0).max(100),
  orden: z.number().int().min(0).max(100).optional(),
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

  const piso = await prisma.piso.create({
    data: {
      proyectoId: proyecto.id,
      numero: datos.data.numero,
      orden: datos.data.orden ?? datos.data.numero,
    },
  });

  return NextResponse.json({ ok: true, piso }, { status: 201 });
}
