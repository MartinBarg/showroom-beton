import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiRol } from "@/lib/api-guard";

const esquema = z.object({
  vistaOrigenId: z.string(),
  vistaDestinoId: z.string(),
  videoUrl: z.string().url().nullable(),
});

// Upsert de la transición origen→destino: si existe se actualiza el video,
// si no existe se crea.
export async function POST(req: Request) {
  const guard = await requireApiRol(["OWNER"]);
  if (guard.error) return guard.error;

  const body = await req.json().catch(() => null);
  const datos = esquema.safeParse(body);
  if (!datos.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  if (datos.data.vistaOrigenId === datos.data.vistaDestinoId) {
    return NextResponse.json(
      { error: "Origen y destino no pueden ser la misma vista" },
      { status: 400 }
    );
  }

  const [origen, destino] = await Promise.all([
    prisma.vistaExterior.findUnique({ where: { id: datos.data.vistaOrigenId } }),
    prisma.vistaExterior.findUnique({ where: { id: datos.data.vistaDestinoId } }),
  ]);
  if (!origen || !destino) {
    return NextResponse.json({ error: "Vista inexistente" }, { status: 400 });
  }

  const existente = await prisma.transicionVista.findFirst({
    where: {
      vistaOrigenId: datos.data.vistaOrigenId,
      vistaDestinoId: datos.data.vistaDestinoId,
    },
  });

  const transicion = existente
    ? await prisma.transicionVista.update({
        where: { id: existente.id },
        data: { videoUrl: datos.data.videoUrl },
      })
    : await prisma.transicionVista.create({ data: datos.data });

  return NextResponse.json({ ok: true, transicion });
}
