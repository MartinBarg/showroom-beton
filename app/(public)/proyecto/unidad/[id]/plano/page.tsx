import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Plano" };

export default async function PlanoPage({ params }: { params: { id: string } }) {
  const unidad = await prisma.unidad.findUnique({
    where: { id: params.id },
    select: { numero: true, planoUrl: true },
  });
  if (!unidad) notFound();

  if (!unidad.planoUrl) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-white/20 text-stone-400">
        Todavía no hay plano cargado para la unidad {unidad.numero}.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-white">
      <img
        src={unidad.planoUrl}
        alt={`Plano de la unidad ${unidad.numero}`}
        className="w-full object-contain"
      />
    </div>
  );
}
