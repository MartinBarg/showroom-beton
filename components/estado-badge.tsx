import { Badge } from "@/components/ui/badge";

const VARIANTES = {
  disponible: "success",
  reservada: "warning",
  vendida: "destructive",
} as const;

const ETIQUETAS = {
  disponible: "Disponible",
  reservada: "Reservada",
  vendida: "Vendida",
} as const;

export function EstadoBadge({ estado }: { estado: string }) {
  const variant = VARIANTES[estado as keyof typeof VARIANTES] ?? "secondary";
  const etiqueta = ETIQUETAS[estado as keyof typeof ETIQUETAS] ?? estado;
  return <Badge variant={variant}>{etiqueta}</Badge>;
}
