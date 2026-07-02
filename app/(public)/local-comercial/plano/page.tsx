import { prisma } from "@/lib/prisma";

export const metadata = { title: "Plano del local" };

export default async function LocalPlanoPage() {
  const local = await prisma.unidad.findFirst({
    where: { esLocalComercial: true },
    select: { numero: true, planoUrl: true },
  });

  if (!local?.planoUrl) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-white/20 text-stone-400">
        Todavía no hay plano cargado para el local comercial.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-white">
      <img
        src={local.planoUrl}
        alt={`Plano del local ${local.numero}`}
        className="w-full object-contain"
      />
    </div>
  );
}
