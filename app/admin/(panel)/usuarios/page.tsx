import { prisma } from "@/lib/prisma";
import { GestionUsuarios } from "@/components/panel/gestion-usuarios";

export const metadata = { title: "Usuarios" };

export default async function UsuariosAdminPage() {
  const usuarios = await prisma.usuario.findMany({
    include: { agencia: { select: { nombre: true } } },
    orderBy: [{ rol: "asc" }, { creadoEn: "asc" }],
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Usuarios</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Alta de cuentas DESARROLLADOR y reset de contraseñas. Las cuentas AGENCIA se
        crean desde /admin/agencias junto con su agencia.
      </p>
      <div className="mt-6">
        <GestionUsuarios
          usuarios={usuarios.map((u) => ({
            id: u.id,
            nombre: u.nombre,
            email: u.email,
            rol: u.rol,
            agenciaNombre: u.agencia?.nombre ?? null,
            activo: u.activo,
            ultimoLogin: u.ultimoLogin ? u.ultimoLogin.toISOString() : null,
          }))}
        />
      </div>
    </div>
  );
}
