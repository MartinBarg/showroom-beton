import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Tour360 } from "@/components/public/tour-360";

export const metadata = { title: "Tour 360" };

export default async function Tour360Page({ params }: { params: { id: string } }) {
  const unidad = await prisma.unidad.findUnique({
    where: { id: params.id },
    select: { numero: true, tourKuulaUrl: true },
  });
  if (!unidad) notFound();

  return <Tour360 url={unidad.tourKuulaUrl} titulo={`unidad ${unidad.numero}`} />;
}
