"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";

type Props = {
  unidades: { id: string; etiqueta: string }[];
  unidadInicial: string;
  whatsapp: string;
};

const inputClase =
  "w-full rounded-md border border-white/15 bg-stone-900 px-3 py-2.5 text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60";

export function ContactoForm({ unidades, unidadInicial, whatsapp }: Props) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [unidadId, setUnidadId] = useState(
    unidades.some((u) => u.id === unidadInicial) ? unidadInicial : ""
  );
  const [estado, setEstado] = useState<"inicial" | "enviando" | "ok" | "error">("inicial");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEstado("enviando");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, telefono, mensaje, unidadId }),
      });
      if (!res.ok) throw new Error("Respuesta no ok");
      setEstado("ok");
    } catch {
      setEstado("error");
    }
  }

  if (estado === "ok") {
    return (
      <div className="flex h-fit flex-col items-center gap-3 rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-10 text-center">
        <p className="font-display text-2xl text-white">¡Gracias por tu consulta!</p>
        <p className="text-stone-300">
          Recibimos tus datos y el equipo comercial te va a contactar a la brevedad.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm text-stone-300">
          Nombre *
          <input
            required
            minLength={2}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className={inputClase}
            placeholder="Tu nombre"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-stone-300">
          Email *
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClase}
            placeholder="tu@email.com"
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm text-stone-300">
          Teléfono
          <input
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className={inputClase}
            placeholder="+54 9 11 ..."
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-stone-300">
          Unidad de interés
          <select
            value={unidadId}
            onChange={(e) => setUnidadId(e.target.value)}
            className={inputClase}
          >
            <option value="">Sin preferencia</option>
            {unidades.map((u) => (
              <option key={u.id} value={u.id}>
                {u.etiqueta}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="flex flex-col gap-1.5 text-sm text-stone-300">
        Mensaje
        <textarea
          rows={5}
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          className={inputClase}
          placeholder="Contanos qué estás buscando..."
        />
      </label>

      {estado === "error" && (
        <p className="rounded-md bg-rose-500/15 px-3 py-2 text-sm text-rose-300">
          No pudimos enviar tu consulta. Probá de nuevo en unos minutos.
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={estado === "enviando"}
          className="rounded-md bg-amber-400 px-8 py-2.5 text-sm font-medium text-stone-950 transition-colors hover:bg-amber-300 disabled:opacity-60"
        >
          {estado === "enviando" ? "Enviando..." : "Enviar consulta"}
        </button>
        <a
          href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Hola! Quiero consultar por el proyecto Washington 2346.")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-md border border-emerald-400/50 px-6 py-2.5 text-sm font-medium text-emerald-300 transition-colors hover:bg-emerald-400/10"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp directo
        </a>
      </div>
    </form>
  );
}
