import { MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { googleMapsApiKey, PUNTOS_DE_INTERES } from "@/lib/maps";

export const metadata = { title: "Ubicación" };

export default async function UbicacionPage() {
  const proyecto = await prisma.proyecto.findFirst({ where: { activo: true } });
  const apiKey = googleMapsApiKey();
  const lat = proyecto?.lat ?? -34.5578;
  const lng = proyecto?.lng ?? -58.4632;

  const categorias = [...new Set(PUNTOS_DE_INTERES.map((p) => p.categoria))];

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 pb-20 pt-28 sm:px-6">
      <h1 className="font-display text-4xl text-white">Ubicación</h1>
      <p className="mt-2 flex items-center gap-2 text-stone-400">
        <MapPin className="h-4 w-4 text-amber-400" />
        {proyecto?.ubicacion ?? "Washington 2346, Belgrano, Ciudad de Buenos Aires"}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        {apiKey ? (
          <iframe
            title="Mapa del proyecto"
            src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}&zoom=16`}
            className="aspect-[4/3] w-full rounded-lg border border-white/10 lg:aspect-auto lg:min-h-[520px]"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          // Fallback sin API key real: imagen estática placeholder, la página
          // no se rompe (sección 6 del plan)
          <div className="relative overflow-hidden rounded-lg border border-white/10">
            <img
              src="https://picsum.photos/seed/mapa-belgrano/1200/900"
              alt="Mapa placeholder de la zona"
              className="aspect-[4/3] w-full object-cover opacity-60 lg:aspect-auto lg:h-full lg:min-h-[520px]"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-stone-950/60 text-center">
              <MapPin className="h-10 w-10 text-amber-400" />
              <p className="max-w-sm px-4 text-stone-200">
                Mapa interactivo no disponible: falta la API key de Google Maps.
              </p>
              <p className="px-4 text-xs text-stone-400">
                Configurar NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para ver el mapa real.
              </p>
            </div>
          </div>
        )}

        <aside className="space-y-6">
          {categorias.map((categoria) => (
            <div
              key={categoria}
              className="rounded-lg border border-white/10 bg-stone-900/60 p-5"
            >
              <h2 className="text-xs font-semibold uppercase tracking-widest text-amber-400">
                {categoria}
              </h2>
              <ul className="mt-3 space-y-2.5">
                {PUNTOS_DE_INTERES.filter((p) => p.categoria === categoria).map((punto) => (
                  <li key={punto.nombre} className="flex justify-between gap-3 text-sm">
                    <span className="text-stone-200">{punto.nombre}</span>
                    <span className="shrink-0 text-stone-500">{punto.distancia}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>
      </div>
    </main>
  );
}
