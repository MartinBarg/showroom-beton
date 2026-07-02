import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiRol } from "@/lib/api-guard";
import { ESTADOS_UNIDAD, TIPOLOGIAS } from "@/lib/types";

// El DESARROLLADOR solo gestiona estado comercial; el OWNER edita todo el
// contenido desde el panel interno.
const esquemaDesarrollador = z.object({
  estado: z.enum(ESTADOS_UNIDAD).optional(),
  agenciaId: z.string().nullable().optional(),
});

const esquemaOwner = esquemaDesarrollador.extend({
  numero: z.string().min(1).max(20).optional(),
  tipologia: z.enum(TIPOLOGIAS).optional(),
  superficieTotal: z.number().positive().optional(),
  superficieCubierta: z.number().min(0).optional(),
  superficieDescubierta: z.number().min(0).optional(),
  orientacion: z.string().min(1).max(40).optional(),
  precio: z.number().min(0).optional(),
  esLocalComercial: z.boolean().optional(),
  destacada: z.boolean().optional(),
  renderUrl: z.string().url().nullable().optional(),
  planoUrl: z.string().url().nullable().optional(),
  galeria: z.array(z.string().url()).optional(),
  tourKuulaUrl: z.string().url().nullable().optional(),
  descripcion: z.string().max(3000).nullable().optional(),
  pisoId: z.string().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireApiRol(["DESARROLLADOR", "OWNER"]);
  if (guard.error) return guard.error;
  const { usuario } = guard;

  const body = await req.json().catch(() => null);
  const esquema = usuario.rol === "OWNER" ? esquemaOwner : esquemaDesarrollador;
  const datos = esquema.safeParse(body);
  if (!datos.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const unidad = await prisma.unidad.findUnique({ where: { id: params.id } });
  if (!unidad) return NextResponse.json({ error: "Unidad no encontrada" }, { status: 404 });

  if (datos.data.agenciaId) {
    const agencia = await prisma.agencia.findUnique({ where: { id: datos.data.agenciaId } });
    if (!agencia) return NextResponse.json({ error: "Agencia inexistente" }, { status: 400 });
  }
  if ("pisoId" in datos.data && datos.data.pisoId) {
    const piso = await prisma.piso.findUnique({ where: { id: datos.data.pisoId } });
    if (!piso) return NextResponse.json({ error: "Piso inexistente" }, { status: 400 });
  }

  const { galeria, ...resto } = datos.data as z.infer<typeof esquemaOwner>;
  const cambios: Record<string, unknown> = { ...resto };
  if (galeria !== undefined) cambios.galeria = JSON.stringify(galeria);
  // Una unidad disponible no puede quedar asignada a una agencia
  const estadoFinal = datos.data.estado ?? unidad.estado;
  if (estadoFinal === "disponible") cambios.agenciaId = null;

  const actualizada = await prisma.unidad.update({
    where: { id: params.id },
    data: cambios,
  });

  return NextResponse.json({ ok: true, unidad: actualizada });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const guard = await requireApiRol(["OWNER"]);
  if (guard.error) return guard.error;

  const unidad = await prisma.unidad.findUnique({ where: { id: params.id } });
  if (!unidad) return NextResponse.json({ error: "Unidad no encontrada" }, { status: 404 });

  await prisma.unidad.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
