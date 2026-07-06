// Lógica de permisos por ruta. Función pura y sin dependencias para poder
// testearla exhaustivamente (rol × ruta) y usarla desde el middleware.
import type { Rol } from "./types";

// Secciones de carga de contenido: exclusivas del OWNER (dueño del proyecto).
// Sus APIs también son solo-OWNER.
const ADMIN_SOLO_OWNER = [
  "/admin/proyecto",
  "/admin/vistas-exterior",
  "/admin/contenido-unidades",
  "/admin/usuarios",
];

// Secciones comerciales: DESARROLLADOR y OWNER. La AGENCIA no entra (solo ve su
// dashboard y sus leads).
const ADMIN_SIN_AGENCIA = [
  "/admin/unidades",
  "/admin/obra",
  "/admin/pagos",
  "/admin/agencias",
];

export type AccesoResultado =
  | { permitido: true }
  | { permitido: false; redirigirA: string };

function coincide(pathname: string, rutas: string[]): boolean {
  return rutas.some((ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`));
}

export function evaluarAcceso(pathname: string, rol: Rol | null): AccesoResultado {
  // Página de login: siempre accesible (el rate limiting la protege)
  if (pathname === "/admin/login") {
    return { permitido: true };
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!rol) return { permitido: false, redirigirA: "/admin/login" };

    // Contenido: solo OWNER. El resto rebota al dashboard.
    if (coincide(pathname, ADMIN_SOLO_OWNER) && rol !== "OWNER") {
      return { permitido: false, redirigirA: "/admin/dashboard" };
    }

    // Comercial: OWNER y DESARROLLADOR. La AGENCIA rebota al dashboard.
    if (coincide(pathname, ADMIN_SIN_AGENCIA) && rol === "AGENCIA") {
      return { permitido: false, redirigirA: "/admin/dashboard" };
    }

    // Dashboard y leads: cualquier rol autenticado.
    return { permitido: true };
  }

  // Todo lo demás es público
  return { permitido: true };
}
