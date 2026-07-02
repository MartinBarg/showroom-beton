import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { notificarNuevoLead } from "@/lib/mailer";

const esquema = z.object({
  nombre: z.string().min(2).max(120),
  email: z.string().email().max(200),
  telefono: z.string().max(50).optional().or(z.literal("")),
  mensaje: z.string().max(2000).optional().or(z.literal("")),
  unidadId: z.string().optional().or(z.literal("")),
});

// Público: formulario de contacto → crea lead en estado "Lead" y notifica
// al desarrollador (Resend real o mock por consola).
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const datos = esquema.safeParse(body);
  if (!datos.success) {
    return NextResponse.json(
      { error: "Revisá los datos del formulario" },
      { status: 400 }
    );
  }

  let unidadId: string | null = datos.data.unidadId || null;
  let unidadNumero: string | null = null;
  if (unidadId) {
    const unidad = await prisma.unidad.findUnique({ where: { id: unidadId } });
    if (unidad) {
      unidadNumero = unidad.numero;
    } else {
      unidadId = null;
    }
  }

  const lead = await prisma.lead.create({
    data: {
      nombre: datos.data.nombre,
      email: datos.data.email,
      telefono: datos.data.telefono || null,
      mensaje: datos.data.mensaje || null,
      unidadId,
      estado: "Lead",
    },
  });

  // La notificación no bloquea la creación del lead si falla
  try {
    await notificarNuevoLead({
      nombre: lead.nombre,
      email: lead.email,
      telefono: lead.telefono,
      mensaje: lead.mensaje,
      unidadNumero,
    });
  } catch (e) {
    console.error("[mailer] Falló la notificación del lead", e);
  }

  return NextResponse.json({ ok: true, id: lead.id });
}
