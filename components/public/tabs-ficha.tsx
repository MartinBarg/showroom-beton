"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { sufijo: "plano", etiqueta: "Plano" },
  { sufijo: "galeria", etiqueta: "Galería" },
  { sufijo: "tour360", etiqueta: "Tour 360" },
];

export function TabsFicha({ basePath }: { basePath: string }) {
  const pathname = usePathname();
  return (
    <div className="flex gap-1 rounded-full bg-stone-950/70 p-1.5 backdrop-blur">
      {TABS.map((tab) => {
        const href = `${basePath}/${tab.sufijo}`;
        const activa = pathname === href;
        return (
          <Link
            key={tab.sufijo}
            href={href}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm transition-colors",
              activa ? "bg-amber-400 text-stone-950" : "text-stone-300 hover:bg-white/10"
            )}
          >
            {tab.etiqueta}
          </Link>
        );
      })}
    </div>
  );
}
