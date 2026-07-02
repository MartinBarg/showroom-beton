import Link from "next/link";
import type { Rol } from "@/lib/types";

// Barra flotante para usuarios con sesión activa que navegan el showroom
// público (sección 4 del plan).
export function BarraAdmin({ rol }: { rol: Rol }) {
  const destino = rol === "OWNER" ? "/panel-interno/proyecto" : "/admin/dashboard";
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-center gap-3 bg-amber-400 px-4 py-2.5 text-sm font-medium text-stone-950">
      <span>Estás viendo el showroom como visitante</span>
      <Link
        href={destino}
        className="rounded-md bg-stone-950 px-3 py-1 text-amber-300 transition-colors hover:bg-stone-800"
      >
        Volver al admin →
      </Link>
    </div>
  );
}
