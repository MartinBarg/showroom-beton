import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t border-white/10 bg-stone-950 py-10 text-stone-400">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 text-center text-sm sm:px-6">
        <p className="font-display text-lg text-stone-200">
          Washington <span className="text-amber-400">2346</span>
        </p>
        <p>Washington 2346, Belgrano · Ciudad de Buenos Aires</p>
        <div className="flex gap-5">
          <Link href="/proyecto" className="hover:text-stone-200">
            Proyecto
          </Link>
          <Link href="/catalogo" className="hover:text-stone-200">
            Catálogo
          </Link>
          <Link href="/contacto" className="hover:text-stone-200">
            Contacto
          </Link>
        </div>
        <p className="text-xs text-stone-500">
          Las imágenes y renders son ilustrativos y no constituyen oferta. Contenido
          placeholder — reemplazar con textos legales reales antes de publicar.
        </p>
      </div>
    </footer>
  );
}
