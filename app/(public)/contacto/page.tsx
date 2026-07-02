import { Mail, MapPin, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ContactoForm } from "@/components/public/contacto-form";

export const metadata = { title: "Contacto" };

export default async function ContactoPage({
  searchParams,
}: {
  searchParams: { unidad?: string };
}) {
  const unidades = await prisma.unidad.findMany({
    select: { id: true, numero: true, esLocalComercial: true },
    orderBy: { numero: "asc" },
  });

  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5491100000000";

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 pb-20 pt-28 sm:px-6">
      <h1 className="font-display text-4xl text-white">Contacto</h1>
      <p className="mt-2 max-w-xl text-stone-400">
        Dejanos tus datos y el equipo comercial te contacta a la brevedad. También
        podés escribirnos directo por WhatsApp.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
        <ContactoForm
          unidades={unidades.map((u) => ({
            id: u.id,
            etiqueta: u.esLocalComercial ? `Local ${u.numero}` : `Unidad ${u.numero}`,
          }))}
          unidadInicial={searchParams.unidad ?? ""}
          whatsapp={whatsapp}
        />

        <aside className="h-fit space-y-5 rounded-lg border border-white/10 bg-stone-900/60 p-6 text-sm">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-amber-400">
            Datos del desarrollador
          </h2>
          <p className="flex items-start gap-3 text-stone-300">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            Washington 2346, Belgrano
            <br />
            Ciudad de Buenos Aires
          </p>
          <p className="flex items-center gap-3 text-stone-300">
            <Phone className="h-4 w-4 shrink-0 text-amber-400" />
            +54 11 0000-0000 (placeholder)
          </p>
          <p className="flex items-center gap-3 text-stone-300">
            <Mail className="h-4 w-4 shrink-0 text-amber-400" />
            ventas@washington2346.local (placeholder)
          </p>
          <p className="border-t border-white/10 pt-4 text-xs leading-relaxed text-stone-500">
            Al enviar el formulario aceptás ser contactado por el equipo comercial del
            proyecto. Texto legal placeholder — reemplazar por la política de datos
            personales real.
          </p>
        </aside>
      </div>
    </main>
  );
}
