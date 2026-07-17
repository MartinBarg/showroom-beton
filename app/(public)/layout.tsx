import { getSession } from "@/lib/session";
import { AppMenu } from "@/components/public/app-menu";
import { BarraAdmin } from "@/components/public/barra-admin";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <AppMenu />
      {children}
      {session?.user && <BarraAdmin />}
    </div>
  );
}
