"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatearPrecio } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AgenciaFila = {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  activa: boolean;
  cuentas: string[];
  leads: number;
  won: number;
  vendidas: number;
  reservadas: number;
  comisionTotal: number;
};

export function TablaAgencias({ agencias }: { agencias: AgenciaFila[] }) {
  const router = useRouter();
  const [cambiando, setCambiando] = useState<string | null>(null);

  async function toggleActiva(agencia: AgenciaFila) {
    setCambiando(agencia.id);
    try {
      const res = await fetch(`/api/agencias/${agencia.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activa: !agencia.activa }),
      });
      if (res.ok) router.refresh();
    } finally {
      setCambiando(null);
    }
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Agencia</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Cuentas</TableHead>
            <TableHead className="text-right">Leads</TableHead>
            <TableHead className="text-right">Won</TableHead>
            <TableHead className="text-right">Reservadas</TableHead>
            <TableHead className="text-right">Vendidas</TableHead>
            <TableHead className="text-right">Comisiones</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {agencias.map((a) => (
            <TableRow key={a.id} className={!a.activa ? "opacity-60" : ""}>
              <TableCell className="font-medium">{a.nombre}</TableCell>
              <TableCell>
                <p>{a.email}</p>
                {a.telefono && <p className="text-xs text-muted-foreground">{a.telefono}</p>}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {a.cuentas.length > 0 ? a.cuentas.join(", ") : "Sin cuenta"}
              </TableCell>
              <TableCell className="text-right">{a.leads}</TableCell>
              <TableCell className="text-right">{a.won}</TableCell>
              <TableCell className="text-right">{a.reservadas}</TableCell>
              <TableCell className="text-right">{a.vendidas}</TableCell>
              <TableCell className="text-right">{formatearPrecio(a.comisionTotal)}</TableCell>
              <TableCell>
                <Badge variant={a.activa ? "success" : "secondary"}>
                  {a.activa ? "Activa" : "Inactiva"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={cambiando === a.id}
                  onClick={() => void toggleActiva(a)}
                >
                  {a.activa ? "Desactivar" : "Activar"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
