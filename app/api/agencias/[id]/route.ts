import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiRol } from "@/lib/api-guard";

const esquema = z.object({
  activa: z.boolean().optional(),
  nombre: z.string().min(2).max(150).optional(),
  email: z.string().email().max(200).optional(),
  telefono: z.string().max(50).nullable().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireApiRol(["DESARROLLADOR", "OWNER"]);
  if (guard.error) return guard.error;

  const body = await req.json().catch(() => null);
  const datos = esquema.safeParse(body);
  if (!datos.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const existente = await prisma.agencia.findUnique({ where: { id: params.id } });
  if (!existente) return NextResponse.json({ error: "Agencia no encontrada" }, { status: 404 });

  const agencia = await prisma.agencia.update({
    where: { id: params.id },
    data: datos.data,
  });

  // Desactivar la agencia también bloquea el login de sus cuentas
  if (datos.data.activa !== undefined) {
    await prisma.usuario.updateMany({
      where: { agenciaId: params.id },
      data: { activo: datos.data.activa },
    });
  }

  return NextResponse.json({ ok: true, agencia });
}
