import { prisma } from "@/lib/prisma";
import { Tour360 } from "@/components/public/tour-360";

export const metadata = { title: "Tour 360 del local" };

export default async function LocalTour360Page() {
  const local = await prisma.unidad.findFirst({
    where: { esLocalComercial: true },
    select: { tourKuulaUrl: true },
  });

  return <Tour360 url={local?.tourKuulaUrl ?? null} titulo="el local comercial" />;
}
