import { Compass } from "lucide-react";

// Tour 360 de Kuula embebido por iframe. Si la unidad todavía no tiene URL
// real, se muestra un placeholder visual (sección 6 del plan).
export function Tour360({ url, titulo }: { url: string | null; titulo: string }) {
  if (!url) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-white/20 bg-stone-900/60 text-center">
        <Compass className="h-10 w-10 text-amber-400/70" />
        <p className="px-6 text-stone-300">
          Tour 360 — reemplazar con URL de Kuula desde el panel interno
        </p>
        <p className="px-6 text-xs text-stone-500">
          Cuando se cargue la URL del tour de {titulo}, acá se va a ver el recorrido
          inmersivo embebido.
        </p>
      </div>
    );
  }

  return (
    <iframe
      src={url}
      title={`Tour 360 — ${titulo}`}
      className="aspect-video w-full rounded-lg border border-white/10"
      allow="xr-spatial-tracking; gyroscope; accelerometer; fullscreen"
      allowFullScreen
      loading="lazy"
    />
  );
}
