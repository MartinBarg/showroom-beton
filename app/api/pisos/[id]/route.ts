import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRol } from "@/lib/api-guard";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const guard = await requireApiRol(["OWNER"]);
  if (guard.error) return guard.error;

  const piso = await prisma.piso.findUnique({
    where: { id: params.id },
    include: { _count: { select: { unidades: true } } },
  });
  if (!piso) return NextResponse.json({ error: "Piso no encontrado" }, { status: 404 });
  if (piso._count.unidades > 0) {
    return NextResponse.json(
      { error: "El piso tiene unidades: borralas o movelas primero" },
      { status: 400 }
    );
  }

  await prisma.piso.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
