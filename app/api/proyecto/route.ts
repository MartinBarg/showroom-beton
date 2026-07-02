import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiRol } from "@/lib/api-guard";

const esquema = z.object({
  nombre: z.string().min(2).max(150).optional(),
  descripcion: z.string().max(5000).optional(),
  ubicacion: z.string().max(300).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  fechaEntrega: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  cantidadPisos: z.number().int().min(1).max(100).optional(),
  activo: z.boolean().optional(),
});

export async function PATCH(req: Request) {
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

  const { fechaEntrega, ...resto } = datos.data;
  const actualizado = await prisma.proyecto.update({
    where: { id: proyecto.id },
    data: {
      ...resto,
      ...(fechaEntrega !== undefined && {
        fechaEntrega: fechaEntrega ? new Date(`${fechaEntrega}T12:00:00Z`) : null,
      }),
    },
  });

  return NextResponse.json({ ok: true, proyecto: actualizado });
}
