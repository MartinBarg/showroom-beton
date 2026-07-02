import { NuevaAgenciaForm } from "@/components/admin/nueva-agencia-form";

export const metadata = { title: "Nueva agencia" };

export default function NuevaAgenciaPage() {
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold">Nueva agencia</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Al crearla se genera una cuenta de acceso con contraseña temporal que vas a
        ver una sola vez.
      </p>
      <div className="mt-6">
        <NuevaAgenciaForm />
      </div>
    </div>
  );
}
