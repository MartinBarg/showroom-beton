import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Un valor de env se considera placeholder si está vacío, es literalmente
// "placeholder" o contiene esa palabra (convención de .env.example).
export function esPlaceholder(valor: string | undefined | null): boolean {
  if (!valor) return true;
  return valor.trim() === "" || valor.toLowerCase().includes("placeholder");
}

// Campos String de SQLite que guardan arrays JSON (galeria, imagenes)
export function parseJsonArray(valor: string | null | undefined): string[] {
  if (!valor) return [];
  try {
    const parsed = JSON.parse(valor);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function formatearPrecio(monto: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(monto);
}

export function formatearFecha(fecha: Date | string): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(typeof fecha === "string" ? new Date(fecha) : fecha);
}

export function formatearSuperficie(m2: number): string {
  return `${m2.toLocaleString("es-AR")} m²`;
}
