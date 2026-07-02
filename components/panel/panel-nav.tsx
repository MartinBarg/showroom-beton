"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/panel-interno/proyecto", etiqueta: "Proyecto" },
  { href: "/panel-interno/vistas-exterior", etiqueta: "Vistas exterior" },
  { href: "/panel-interno/unidades", etiqueta: "Unidades" },
  { href: "/panel-interno/usuarios", etiqueta: "Usuarios" },
];

export function PanelInternoNav() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1 overflow-x-auto">
      {LINKS.map((link) => (
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
