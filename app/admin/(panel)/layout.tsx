import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AdminNav } from "@/components/admin/admin-nav";
import { SignOutButton } from "@/components/admin/signout-button";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Panel de gestión" };

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defensa en profundidad: el middleware ya valida, pero nunca confiamos
  // solo en él.
  const session = await getSession();
  if (!session?.user) redirect("/admin/login");
  const { rol, name } = session.user;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <Link href="/admin/dashboard" className="font-display text-lg">
            Washington <span className="text-accent">2346</span>
          </Link>
          <AdminNav rol={rol} />
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{name}</span>
            <Badge variant="secondary">{rol}</Badge>
            <Link
              href="/"
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              Ver showroom
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
