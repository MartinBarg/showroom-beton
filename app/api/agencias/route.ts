import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireApiRol } from "@/lib/api-guard";

const esquema = z.object({
  nombre: z.string().min(2).max(150),
  email: z.string().email().max(200),
  telefono: z.string().max(50).optional().or(z.literal("")),
  cuentaEmail: z.string().email().max(200),
});

// Alta de agencia: crea la agencia + su cuenta de usuario con contraseña
// temporal (se devuelve una sola vez).
export async function POST(req: Request) {
  const guard = await requireApiRol(["DESARROLLADOR", "OWNER"]);
  if (guard.error) return guard.error;

  const body = await req.json().catch(() => null);
  const datos = esquema.safeParse(body);
  if (!datos.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const emailCuenta = datos.data.cuentaEmail.toLowerCase();
  const existente = await prisma.usuario.findUnique({ where: { email: emailCuenta } });
  if (existente) {
    return NextResponse.json(
      { error: "Ya existe un usuario con ese email de cuenta" },
      { status: 400 }
    );
  }

  const passwordTemporal = randomBytes(9).toString("base64url");
  const passwordHash = await bcrypt.hash(passwordTemporal, 12);

  const agencia = await prisma.agencia.create({
    data: {
      nombre: datos.data.nombre,
      email: datos.data.email,
      telefono: datos.data.telefono || null,
      activa: true,
      usuarios: {
        create: {
          nombre: `Cuenta ${datos.data.nombre}`,
          email: emailCuenta,
          passwordHash,
          rol: "AGENCIA",
          activo: true,
        },
      },
    },
  });

  return NextResponse.json(
    { ok: true, agenciaId: agencia.id, cuentaEmail: emailCuenta, passwordTemporal },
    { status: 201 }
  );
}
