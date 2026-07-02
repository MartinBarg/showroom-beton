import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { evaluarAcceso } from "@/lib/rbac";
import type { Rol } from "@/lib/types";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const rol = (token?.rol as Rol | undefined) ?? null;

  const acceso = evaluarAcceso(req.nextUrl.pathname, rol);
  if (!acceso.permitido) {
    return NextResponse.redirect(new URL(acceso.redirigirA, req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/panel-interno", "/panel-interno/:path*"],
};
