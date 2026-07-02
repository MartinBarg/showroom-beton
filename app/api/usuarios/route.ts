import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireApiRol } from "@/lib/api-guard";

const esquema = z.object({
  nombre: z.string().min(2).max(150),
  email: z.string().email().max(200),
});

// Alta de cuentas DESARROLLADOR (las cuentas AGENCIA se crean desde
// /admin/agencias junto con su agencia).
export async function POST(req: Request) {
  const guard = await requireApiRol(["OWNER"]);
  if (guard.error) return guard.error;

  const body = await req.json().catch(() => null);
  const datos = esquema.safeParse(body);
  if (!datos.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const email = datos.data.email.toLowerCase();
  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) {
    return NextResponse.json({ error: "Ya existe un usuario con ese email" }, { status: 400 });
  }

  const passwordTemporal = randomBytes(9).toString("base64url");
  const usuario = await prisma.usuario.create({
    data: {
      nombre: datos.data.nombre,
      email,
      passwordHash: await bcrypt.hash(passwordTemporal, 12),
      rol: "DESARROLLADOR",
      activo: true,
    },
  });

  return NextResponse.json(
    { ok: true, usuarioId: usuario.id, email, passwordTemporal },
    { status: 201 }
  );
}
