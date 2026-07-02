// Email de notificación de leads: Resend en producción, log en consola si la
// API key es placeholder (sección 6 del plan).
import { Resend } from "resend";
import { prisma } from "./prisma";
import { esPlaceholder } from "./utils";

type DatosLead = {
  nombre: string;
  email: string;
  telefono?: string | null;
  mensaje?: string | null;
  unidadNumero?: string | null;
};

export function resendConfigurado(): boolean {
  return !esPlaceholder(process.env.RESEND_API_KEY);
}

export async function notificarNuevoLead(lead: DatosLead): Promise<void> {
  const resumen = `${lead.nombre} <${lead.email}>${lead.telefono ? ` · ${lead.telefono}` : ""}${lead.unidadNumero ? ` · Unidad ${lead.unidadNumero}` : ""}`;

  if (!resendConfigurado()) {
    console.log(`[EMAIL MOCK] Nuevo lead: ${resumen}${lead.mensaje ? ` — "${lead.mensaje}"` : ""}`);
    return;
  }

  const desarrolladores = await prisma.usuario.findMany({
    where: { rol: "DESARROLLADOR", activo: true },
    select: { email: true },
  });
  if (desarrolladores.length === 0) return;

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "showroom@washington2346.local",
    to: desarrolladores.map((d) => d.email),
    subject: `Nuevo lead: ${lead.nombre}`,
    html: `
      <h2>Nuevo lead en el showroom Washington 2346</h2>
      <p><strong>Nombre:</strong> ${lead.nombre}</p>
      <p><strong>Email:</strong> ${lead.email}</p>
      ${lead.telefono ? `<p><strong>Teléfono:</strong> ${lead.telefono}</p>` : ""}
      ${lead.unidadNumero ? `<p><strong>Unidad de interés:</strong> ${lead.unidadNumero}</p>` : ""}
      ${lead.mensaje ? `<p><strong>Mensaje:</strong> ${lead.mensaje}</p>` : ""}
      <p><a href="${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/admin/leads">Ver en el panel</a></p>
    `,
  });
}
