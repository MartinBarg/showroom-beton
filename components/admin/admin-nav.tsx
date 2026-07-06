"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Rol } from "@/lib/types";

// `roles` ausente = visible para todos los roles autenticados.
const LINKS: Array<{ href: string; etiqueta: string; roles?: Rol[] }> = [
  { href: "/admin/dashboard", etiqueta: "Dashboard" },
  { href: "/admin/leads", etiqueta: "Leads" },
  { href: "/admin/unidades", etiqueta: "Unidades", roles: ["DESARROLLADOR", "OWNER"] },
  { href: "/admin/obra", etiqueta: "Obra", roles: ["DESARROLLADOR", "OWNER"] },
  { href: "/admin/pagos", etiqueta: "Pagos", roles: ["DESARROLLADOR", "OWNER"] },
  { href: "/admin/agencias", etiqueta: "Agencias", roles: ["DESARROLLADOR", "OWNER"] },
  { href: "/admin/proyecto", etiqueta: "Proyecto", roles: ["OWNER"] },
  { href: "/admin/vistas-exterior", etiqueta: "Vistas", roles: ["OWNER"] },
  { href: "/admin/contenido-unidades", etiqueta: "Contenido", roles: ["OWNER"] },
  { href: "/admin/usuarios", etiqueta: "Usuarios", roles: ["OWNER"] },
];

export function AdminNav({ rol }: { rol: Rol }) {
  const pathname = usePathname();
  const visibles = LINKS.filter((l) => !l.roles || l.roles.includes(rol));

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
