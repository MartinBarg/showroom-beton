"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export function NuevaAgenciaForm() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [cuentaEmail, setCuentaEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{
    nombre: string;
    email: string;
    password: string;
  } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch("/api/agencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          email,
          telefono,
          cuentaEmail: cuentaEmail || email,
        }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error ?? "No se pudo crear la agencia");
      setResultado({
        nombre,
        email: body.cuentaEmail,
        password: body.passwordTemporal,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setEnviando(false);
    }
  }

  if (resultado) {
    return (
      <Card>
        <CardContent className="space-y-4 p-6">
          <p className="font-medium text-emerald-700">
            ✓ Agencia “{resultado.nombre}” creada
          </p>
          <div className="rounded-md bg-secondary p-4 text-sm">
            <p>
              <span className="text-muted-foreground">Usuario:</span>{" "}
              <code className="font-mono">{resultado.email}</code>
            </p>
            <p className="mt-1">
              <span className="text-muted-foreground">Contraseña temporal:</span>{" "}
              <code className="font-mono text-base font-semibold">{resultado.password}</code>
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Guardá esta contraseña ahora: no se vuelve a mostrar. Compartila con la
            agencia por un canal seguro.
          </p>
          <Link href="/admin/agencias" className="inline-block text-sm underline">
            ← Volver al listado
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="nombre">Nombre de la agencia</Label>
        <Input id="nombre" required value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email de contacto</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="telefono">Teléfono</Label>
        <Input id="telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cuentaEmail">Email de la cuenta de acceso (opcional)</Label>
        <Input
          id="cuentaEmail"
          type="email"
          value={cuentaEmail}
          onChange={(e) => setCuentaEmail(e.target.value)}
          placeholder="Si queda vacío se usa el email de contacto"
        />
      </div>
      {error && (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={enviando}>
          {enviando ? "Creando..." : "Crear agencia"}
        </Button>
        <Link href="/admin/agencias" className={buttonVariants({ variant: "secondary" })}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
