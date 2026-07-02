"use client";

import { useEffect } from "react";

// Registra una visita (general o a una unidad) una vez por sesión de browser.
// El sessionId vive en localStorage; la dedup por página en sessionStorage.
export function VisitaTracker({ unidadId }: { unidadId?: string }) {
  useEffect(() => {
    try {
      let sessionId = localStorage.getItem("showroom-session-id");
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem("showroom-session-id", sessionId);
      }

      const clave = `visita-registrada-${unidadId ?? "general"}`;
      if (sessionStorage.getItem(clave)) return;
      sessionStorage.setItem(clave, "1");

      void fetch("/api/visitas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, unidadId: unidadId ?? null }),
      });
    } catch {
      // El tracking nunca debe romper la navegación
    }
  }, [unidadId]);

  return null;
}
