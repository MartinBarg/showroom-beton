// Validación de rol server-side para route handlers. Las APIs nunca confían
// en el frontend: cada handler declara qué roles acepta.
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import type { Rol } from "./types";

export type UsuarioApi = {
  id: string;
  rol: Rol;
  agenciaId: string | null;
};

type ResultadoGuard =
  | { usuario: UsuarioApi; error?: undefined }
  | { usuario?: undefined; error: NextResponse };

export async function requireApiRol(roles: Rol[]): Promise<ResultadoGuard> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "No autenticado" }, { status: 401 }) };
  }
  if (!roles.includes(session.user.rol)) {
    return { error: NextResponse.json({ error: "Sin permisos" }, { status: 403 }) };
  }
  return {
    usuario: {
      id: session.user.id,
      rol: session.user.rol,
      agenciaId: session.user.agenciaId,
    },
  };
}
