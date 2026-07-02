// Lógica de permisos por ruta. Función pura y sin dependencias para poder
// testearla exhaustivamente (rol × ruta) y usarla desde el middleware.
import type { Rol } from "./types";

// Rutas de /admin reservadas al DESARROLLADOR (sección 3 del plan)
const ADMIN_SOLO_DESARROLLADOR = [
  "/admin/unidades",
  "/admin/agencias",
  "/admin/obra",
  "/admin/pagos",
];

export type AccesoResultado =
  | { permitido: true }
  | { permitido: false; redirigirA: string };

export function evaluarAcceso(pathname: string, rol: Rol | null): AccesoResultado {
  // Páginas de login: siempre accesibles (el rate limiting las protege)
  if (pathname === "/admin/login" || pathname === "/panel-interno/login") {
    return { permitido: true };
  }

  if (pathname === "/panel-interno" || pathname.startsWith("/panel-interno/")) {
    if (rol !== "OWNER") return { permitido: false, redirigirA: "/" };
    return { permitido: true };
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!rol) return { permitido: false, redirigirA: "/admin/login" };
    if (
      ADMIN_SOLO_DESARROLLADOR.some(
        (ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`)
      ) &&
      rol !== "DESARROLLADOR"
    ) {
      return { permitido: false, redirigirA: "/admin/dashboard" };
    }
    return { permitido: true };
  }

  // Todo lo demás es público
  return { permitido: true };
}
