import { prisma } from "@/lib/prisma";
import { parseJsonArray } from "@/lib/utils";
import { GaleriaGrid } from "@/components/public/galeria-grid";

export const metadata = { title: "Galería del local" };

export default async function LocalGaleriaPage() {
  const local = await prisma.unidad.findFirst({
    where: { esLocalComercial: true },
    select: { galeria: true },
  });

  return (
    <GaleriaGrid
      imagenes={parseJsonArray(local?.galeria)}
      titulo="el local comercial"
    />
  );
}
