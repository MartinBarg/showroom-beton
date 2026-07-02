import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseJsonArray } from "@/lib/utils";
import { GaleriaGrid } from "@/components/public/galeria-grid";

export const metadata = { title: "Galería" };

export default async function GaleriaPage({ params }: { params: { id: string } }) {
  const unidad = await prisma.unidad.findUnique({
    where: { id: params.id },
    select: { numero: true, galeria: true },
  });
  if (!unidad) notFound();

  return (
    <GaleriaGrid
      imagenes={parseJsonArray(unidad.galeria)}
      titulo={`la unidad ${unidad.numero}`}
    />
  );
}
