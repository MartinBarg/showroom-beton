import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiRol } from "@/lib/api-guard";

const esquema = z.object({
  estado: z.enum(["pendiente", "pagada"]),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireApiRol(["DESARROLLADOR"]);
  if (guard.error) return guard.error;

  const body = await req.json().catch(() => null);
  const datos = esquema.safeParse(body);
  if (!datos.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const existente = await prisma.comision.findUnique({ where: { id: params.id } });
  if (!existente) {
    return NextResponse.json({ error: "Comisión no encontrada" }, { status: 404 });
  }

  const comision = await prisma.comision.update({
    where: { id: params.id },
    data: {
      estado: datos.data.estado,
      fechaPago: datos.data.estado === "pagada" ? new Date() : null,
    },
  });

  return NextResponse.json({ ok: true, comision });
}
