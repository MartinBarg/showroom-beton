import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireApiRol } from "@/lib/api-guard";

const esquema = z.object({
  resetPassword: z.literal(true).optional(),
  activo: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireApiRol(["OWNER"]);
  if (guard.error) return guard.error;

  const body = await req.json().catch(() => null);
  const datos = esquema.safeParse(body);
  if (!datos.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const usuario = await prisma.usuario.findUnique({ where: { id: params.id } });
  if (!usuario) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

  // Las cuentas OWNER no se tocan desde la API para no dejarse afuera
  if (usuario.rol === "OWNER") {
    return NextResponse.json(
      { error: "Las cuentas OWNER no se modifican desde acá" },
      { status: 403 }
    );
  }

  let passwordTemporal: string | undefined;
  const cambios: Record<string, unknown> = {};

  if (datos.data.activo !== undefined) cambios.activo = datos.data.activo;
  if (datos.data.resetPassword) {
    passwordTemporal = randomBytes(9).toString("base64url");
    cambios.passwordHash = await bcrypt.hash(passwordTemporal, 12);
  }

  await prisma.usuario.update({ where: { id: params.id }, data: cambios });

  return NextResponse.json({ ok: true, ...(passwordTemporal && { passwordTemporal }) });
}
