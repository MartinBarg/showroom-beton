"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Rol } from "@/lib/types";

const LINKS: Array<{ href: string; etiqueta: string; soloDesarrollador?: boolean }> = [
  { href: "/admin/dashboard", etiqueta: "Dashboard" },
  { href: "/admin/leads", etiqueta: "Leads" },
  { href: "/admin/unidades", etiqueta: "Unidades", soloDesarrollador: true },
  { href: "/admin/obra", etiqueta: "Obra", soloDesarrollador: true },
  { href: "/admin/pagos", etiqueta: "Pagos", soloDesarrollador: true },
  { href: "/admin/agencias", etiqueta: "Agencias", soloDesarrollador: true },
];

export function AdminNav({ rol }: { rol: Rol }) {
  const pathname = usePathname();
  const visibles = LINKS.filter((l) => !l.soloDesarrollador || rol === "DESARROLLADOR");

  return (
    <nav className="flex items-center gap-1 overflow-x-auto">
      {visibles.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors",
            pathname.startsWith(link.href)
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          {link.etiqueta}
        </Link>
      ))}
    </nav>
  );
}
