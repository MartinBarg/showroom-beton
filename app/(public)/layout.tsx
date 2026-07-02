import { getSession } from "@/lib/session";
import { PublicNav } from "@/components/public/nav";
import { PublicFooter } from "@/components/public/footer";
import { BarraAdmin } from "@/components/public/barra-admin";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <PublicNav />
      {children}
      <PublicFooter />
      {session?.user && <BarraAdmin rol={session.user.rol} />}
    </div>
  );
}
