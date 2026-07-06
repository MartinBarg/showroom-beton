import { prisma } from "@/lib/prisma";
import { ProyectoForm } from "@/components/panel/proyecto-form";

export const metadata = { title: "Datos del proyecto" };

export default async function ProyectoAdminPage() {
  const proyecto = await prisma.proyecto.findFirst();

  if (!proyecto) {
    return <p className="text-muted-foreground">No hay proyecto cargado (correr el seed).</p>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold">Datos del proyecto</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Estos datos alimentan la landing, la ubicación y los metadatos del showroom.
      </p>
      <div className="mt-6">
        <ProyectoForm
          proyecto={{
            nombre: proyecto.nombre,
            descripcion: proyecto.descripcion,
            ubicacion: proyecto.ubicacion,
            lat: proyecto.lat,
            lng: proyecto.lng,
            fechaEntrega: proyecto.fechaEntrega
              ? proyecto.fechaEntrega.toISOString().slice(0, 10)
              : "",
            cantidadPisos: proyecto.cantidadPisos,
            activo: proyecto.activo,
          }}
        />
      </div>
    </div>
  );
}
