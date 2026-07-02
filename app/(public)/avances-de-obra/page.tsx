import { prisma } from "@/lib/prisma";
import { formatearFecha, parseJsonArray } from "@/lib/utils";
import { GaleriaGrid } from "@/components/public/galeria-grid";

export const metadata = { title: "Avances de obra" };

export default async function AvancesDeObraPage() {
  const avances = await prisma.avanceObra.findMany({
    orderBy: { fechaPublicacion: "desc" },
  });

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 pb-20 pt-28 sm:px-6">
      <h1 className="font-display text-4xl text-white">Avances de obra</h1>
      <p className="mt-2 text-stone-400">
        Seguimiento cronológico de la construcción, de lo más reciente a lo más antiguo.
      </p>

      {avances.length === 0 ? (
        <p className="mt-16 text-center text-stone-400">
          Todavía no hay avances publicados.
        </p>
      ) : (
        <div className="mt-10 space-y-12">
          {avances.map((avance) => (
            <article
              key={avance.id}
              className="rounded-lg border border-white/10 bg-stone-900/60 p-6"
            >
              <time className="text-xs uppercase tracking-widest text-amber-400">
                {formatearFecha(avance.fechaPublicacion)}
              </time>
              <h2 className="mt-2 font-display text-2xl text-white">{avance.titulo}</h2>
              <p className="mt-3 leading-relaxed text-stone-300">{avance.descripcion}</p>
              <div className="mt-5">
                <GaleriaGrid
                  imagenes={parseJsonArray(avance.imagenes)}
                  titulo={avance.titulo}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
