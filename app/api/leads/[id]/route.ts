import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiRol } from "@/lib/api-guard";
import { ESTADOS_LEAD } from "@/lib/types";

const esquema = z.object({
  estado: z.enum(ESTADOS_LEAD).optional(),
  agenciaId: z.string().nullable().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireApiRol(["DESARROLLADOR", "AGENCIA", "OWNER"]);
  if (guard.error) return guard.error;
  const { usuario } = guard;

  const body = await req.json().catch(() => null);
  const datos = esquema.safeParse(body);
  if (!datos.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const lead = await prisma.lead.findUnique({ where: { id: params.id } });
  if (!lead) return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });

  // AGENCIA: solo puede tocar sus propios leads y no puede reasignar agencia
  if (usuario.rol === "AGENCIA") {
    if (lead.agenciaId !== usuario.agenciaId) {
      return NextResponse.json({ error: "Sin permisos sobre este lead" }, { status: 403 });
    }
    if (datos.data.agenciaId !== undefined) {
      return NextResponse.json({ error: "Una agencia no puede reasignar leads" }, { status: 403 });
    }
  }

  if (datos.data.agenciaId) {
    const agencia = await prisma.agencia.findUnique({ where: { id: datos.data.agenciaId } });
    if (!agencia) return NextResponse.json({ error: "Agencia inexistente" }, { status: 400 });
  }

  const actualizado = await prisma.lead.update({
    where: { id: params.id },
    data: {
      ...(datos.data.estado !== undefined && { estado: datos.data.estado }),
      ...(datos.data.agenciaId !== undefined && { agenciaId: datos.data.agenciaId }),
    },
  });

  return NextResponse.json({ ok: true, lead: actualizado });
}
