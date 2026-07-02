"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ModalProps = {
  abierto: boolean;
  onCerrar: () => void;
  titulo?: string;
  children: React.ReactNode;
  className?: string;
};

export function Modal({ abierto, onCerrar, titulo, children, className }: ModalProps) {
  if (!abierto) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onCerrar}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg border bg-card p-6 shadow-xl",
          className
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          {titulo ? <h2 className="text-lg font-semibold">{titulo}</h2> : <span />}
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
