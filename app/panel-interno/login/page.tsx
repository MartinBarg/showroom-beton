import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "@/components/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Panel interno" };

export default async function PanelInternoLoginPage() {
  const session = await getSession();
  if (session?.user?.rol === "OWNER") redirect("/panel-interno/proyecto");

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-100 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Panel interno</CardTitle>
            <CardDescription>Acceso restringido al administrador técnico.</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm destino="/panel-interno/proyecto" />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
