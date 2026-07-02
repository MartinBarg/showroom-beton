import { describe, expect, it } from "vitest";
import { evaluarAcceso } from "@/lib/rbac";
import type { Rol } from "@/lib/types";

const ROLES: Array<Rol | null> = [null, "OWNER", "DESARROLLADOR", "AGENCIA"];

function esperarPermitido(pathname: string, rol: Rol | null) {
  expect(evaluarAcceso(pathname, rol)).toEqual({ permitido: true });
}

function esperarRedireccion(pathname: string, rol: Rol | null, destino: string) {
  expect(evaluarAcceso(pathname, rol)).toEqual({ permitido: false, redirigirA: destino });
}

describe("evaluarAcceso — rutas públicas", () => {
  it("permite el showroom público a cualquier rol incluida la falta de sesión", () => {
    for (const rol of ROLES) {
      esperarPermitido("/", rol);
      esperarPermitido("/proyecto", rol);
      esperarPermitido("/proyecto/unidad/abc/plano", rol);
      esperarPermitido("/catalogo", rol);
      esperarPermitido("/contacto", rol);
    }
  });

  it("permite las páginas de login a cualquiera", () => {
    for (const rol of ROLES) {
      esperarPermitido("/admin/login", rol);
      esperarPermitido("/panel-interno/login", rol);
    }
  });
});

describe("evaluarAcceso — panel interno (solo OWNER)", () => {
  const rutas = [
    "/panel-interno",
    "/panel-interno/proyecto",
    "/panel-interno/vistas-exterior",
    "/panel-interno/unidades",
    "/panel-interno/usuarios",
  ];

  it("permite todo el panel interno al OWNER", () => {
    for (const ruta of rutas) esperarPermitido(ruta, "OWNER");
  });

  it("redirige al showroom a todo rol que no sea OWNER", () => {
    for (const rol of [null, "DESARROLLADOR", "AGENCIA"] as const) {
      for (const ruta of rutas) esperarRedireccion(ruta, rol, "/");
    }
  });
});

describe("evaluarAcceso — admin", () => {
  it("sin sesión redirige a /admin/login", () => {
    for (const ruta of ["/admin", "/admin/dashboard", "/admin/leads", "/admin/unidades"]) {
      esperarRedireccion(ruta, null, "/admin/login");
    }
  });

  it("dashboard y leads accesibles para los tres roles autenticados", () => {
    for (const rol of ["OWNER", "DESARROLLADOR", "AGENCIA"] as const) {
      esperarPermitido("/admin/dashboard", rol);
      esperarPermitido("/admin/leads", rol);
    }
  });

  const soloDesarrollador = [
    "/admin/unidades",
    "/admin/obra",
    "/admin/pagos",
    "/admin/agencias",
    "/admin/agencias/nueva",
  ];

  it("las secciones restringidas quedan disponibles para DESARROLLADOR", () => {
    for (const ruta of soloDesarrollador) esperarPermitido(ruta, "DESARROLLADOR");
  });

  it("AGENCIA y OWNER rebotan al dashboard en las secciones restringidas", () => {
    for (const rol of ["AGENCIA", "OWNER"] as const) {
      for (const ruta of soloDesarrollador) {
        esperarRedireccion(ruta, rol, "/admin/dashboard");
      }
    }
  });

  it("no confunde prefijos parecidos (p. ej. /admin/leads-x vs /admin/leads)", () => {
    // startsWith con "/" evita que /admin/unidadesX matchee /admin/unidades
    esperarPermitido("/admin/unidadesx", "AGENCIA");
  });
});
