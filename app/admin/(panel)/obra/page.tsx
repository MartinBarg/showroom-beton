import { prisma } from "@/lib/prisma";
import { GestionObra } from "@/components/admin/gestion-obra";
import { parseJsonArray } from "@/lib/utils";

export const metadata = { title: "Avances de obra" };

export default async function ObraAdminPage() {
  const avances = await prisma.avanceObra.findMany({
    orderBy: { fechaPublicacion: "desc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Avances de obra</h1>
        <p className="text-sm text-muted-foreground">
          Lo que publiques acá aparece en la página pública /avances-de-obra.
        </p>
      </div>
      <GestionObra
        avancesIniciales={avances.map((a) => ({
          id: a.id,
          titulo: a.titulo,
          descripcion: a.descripcion,
          imagenes: parseJsonArray(a.imagenes),
          fechaPublicacion: a.fechaPublicacion.toISOString().slice(0, 10),
        }))}
      />
    </div>
  );
}
