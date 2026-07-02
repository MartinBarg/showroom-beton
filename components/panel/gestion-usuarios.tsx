"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type UsuarioFila = {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  agenciaNombre: string | null;
  activo: boolean;
  ultimoLogin: string | null;
};

export function GestionUsuarios({ usuarios }: { usuarios: UsuarioFila[] }) {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [credencial, setCredencial] = useState<{ email: string; password: string } | null>(
    null
  );
  const [ocupado, setOcupado] = useState(false);

  async function altaDesarrollador(e: React.FormEvent) {
    e.preventDefault();
    setOcupado(true);
    setError(null);
    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "No se pudo crear el usuario");
      setCredencial({ email: data.email, password: data.passwordTemporal });
      setNombre("");
      setEmail("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setOcupado(false);
    }
  }

  async function resetPassword(usuario: UsuarioFila) {
    if (!window.confirm(`¿Generar nueva contraseña para ${usuario.email}?`)) return;
    setError(null);
    const res = await fetch(`/api/usuarios/${usuario.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resetPassword: true }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setError(data?.error ?? "No se pudo resetear la contraseña");
      return;
    }
    setCredencial({ email: usuario.email, password: data.passwordTemporal });
  }

  async function toggleActivo(usuario: UsuarioFila) {
    setError(null);
    const res = await fetch(`/api/usuarios/${usuario.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: !usuario.activo }),
    });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "No se pudo actualizar el usuario");
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      )}
      {credencial && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm">
          <p className="font-medium text-amber-900">Credenciales generadas (se muestran una sola vez):</p>
          <p className="mt-1">
            Usuario: <code className="font-mono">{credencial.email}</code> · Contraseña:{" "}
            <code className="font-mono text-base font-semibold">{credencial.password}</code>
          </p>
        </div>
      )}

      {/* Alta DESARROLLADOR */}
      <form
        onSubmit={altaDesarrollador}
        className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4"
      >
        <div className="space-y-1.5">
          <Label htmlFor="dev-nombre">Nombre</Label>
          <Input
            id="dev-nombre"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre del desarrollador"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dev-email">Email</Label>
          <Input
            id="dev-email"
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="dev@empresa.com"
          />
        </div>
        <Button type="submit" disabled={ocupado}>
          <Plus className="h-4 w-4" />
          {ocupado ? "Creando..." : "Crear cuenta DESARROLLADOR"}
        </Button>
      </form>

      {/* Listado */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Agencia</TableHead>
              <TableHead>Último login</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.map((u) => (
              <TableRow key={u.id} className={!u.activo ? "opacity-60" : ""}>
                <TableCell className="font-medium">{u.nombre}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Badge variant={u.rol === "OWNER" ? "default" : "secondary"}>{u.rol}</Badge>
                </TableCell>
                <TableCell>{u.agenciaNombre ?? "—"}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {u.ultimoLogin
                    ? new Date(u.ultimoLogin).toLocaleString("es-AR")
                    : "Nunca"}
                </TableCell>
                <TableCell>
                  <Badge variant={u.activo ? "success" : "secondary"}>
                    {u.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {u.rol !== "OWNER" && (
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => void resetPassword(u)}>
                        <KeyRound className="h-3.5 w-3.5" /> Reset contraseña
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => void toggleActivo(u)}>
                        {u.activo ? "Desactivar" : "Activar"}
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
