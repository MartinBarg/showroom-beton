import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { SignOutButton } from "@/components/admin/signout-button";
import { PanelInternoNav } from "@/components/panel/panel-nav";

export const metadata = { title: "Panel interno" };

export default async function PanelInternoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defensa en profundidad además del middleware: solo OWNER
  const session = await getSession();
  if (session?.user?.rol !== "OWNER") redirect("/");

  return (
    <div className="min-h-screen bg-stone-100">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Panel interno
          </span>
          <PanelInternoNav />
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {session.user.email}
            </span>
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
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
