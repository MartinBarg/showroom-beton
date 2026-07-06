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

  it("permite la página de login a cualquiera", () => {
    for (const rol of ROLES) {
      esperarPermitido("/admin/login", rol);
    }
  });
});

describe("evaluarAcceso — admin sin sesión", () => {
  it("redirige a /admin/login toda ruta /admin protegida", () => {
    for (const ruta of [
      "/admin",
      "/admin/dashboard",
      "/admin/leads",
      "/admin/unidades",
      "/admin/proyecto",
      "/admin/vistas-exterior",
      "/admin/contenido-unidades",
      "/admin/usuarios",
    ]) {
      esperarRedireccion(ruta, null, "/admin/login");
    }
  });
});

describe("evaluarAcceso — dashboard y leads (todo rol autenticado)", () => {
  it("accesibles para los tres roles", () => {
    for (const rol of ["OWNER", "DESARROLLADOR", "AGENCIA"] as const) {
      esperarPermitido("/admin/dashboard", rol);
      esperarPermitido("/admin/leads", rol);
    }
  });
});

describe("evaluarAcceso — secciones comerciales (OWNER + DESARROLLADOR)", () => {
  const rutas = [
    "/admin/unidades",
    "/admin/obra",
    "/admin/pagos",
    "/admin/agencias",
    "/admin/agencias/nueva",
  ];

  it("permitidas para OWNER y DESARROLLADOR", () => {
    for (const rol of ["OWNER", "DESARROLLADOR"] as const) {
      for (const ruta of rutas) esperarPermitido(ruta, rol);
    }
  });

  it("la AGENCIA rebota al dashboard", () => {
    for (const ruta of rutas) esperarRedireccion(ruta, "AGENCIA", "/admin/dashboard");
  });
});

describe("evaluarAcceso — secciones de contenido (solo OWNER)", () => {
  const rutas = [
    "/admin/proyecto",
    "/admin/vistas-exterior",
    "/admin/vistas-exterior/abc",
    "/admin/contenido-unidades",
    "/admin/usuarios",
  ];

  it("permitidas solo para OWNER", () => {
    for (const ruta of rutas) esperarPermitido(ruta, "OWNER");
  });

  it("DESARROLLADOR y AGENCIA rebotan al dashboard", () => {
    for (const rol of ["DESARROLLADOR", "AGENCIA"] as const) {
      for (const ruta of rutas) esperarRedireccion(ruta, rol, "/admin/dashboard");
    }
  });
});

describe("evaluarAcceso — no confunde prefijos parecidos", () => {
  it("/admin/unidadesx no matchea /admin/unidades", () => {
    // startsWith con "/" evita que /admin/unidadesX matchee /admin/unidades
    esperarPermitido("/admin/unidadesx", "AGENCIA");
  });

  it("/admin/contenido-unidades no lo bloquea la regla comercial de /admin/unidades", () => {
    esperarPermitido("/admin/contenido-unidades", "OWNER");
  });
});
