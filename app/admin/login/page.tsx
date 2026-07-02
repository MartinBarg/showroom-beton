import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "@/components/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Ingresar" };

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session?.user) redirect("/admin/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-950 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="font-display text-2xl text-stone-100">
            Washington <span className="text-amber-400">2346</span>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Panel de gestión</CardTitle>
            <CardDescription>
              Acceso para el desarrollador y las agencias inmobiliarias.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm destino="/admin/dashboard" />
          </CardContent>
        </Card>
        <p className="text-center text-sm text-stone-400">
          <Link href="/" className="hover:text-stone-200">
            ← Volver al showroom
          </Link>
        </p>
      </div>
    </main>
  );
}
