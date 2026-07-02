// Tipos y constantes de dominio compartidos entre frontend, backend y tests.
// En SQLite no hay enums nativos, así que estas listas son la fuente de verdad.

export const ROLES = ["OWNER", "DESARROLLADOR", "AGENCIA"] as const;
export type Rol = (typeof ROLES)[number];

export const ESTADOS_UNIDAD = ["disponible", "reservada", "vendida"] as const;
export type EstadoUnidad = (typeof ESTADOS_UNIDAD)[number];

export const ESTADOS_LEAD = [
  "Lead",
  "Contactado",
  "Seguimiento",
  "Reserva",
  "Standby",
  "Won",
  "Lost",
] as const;
export type EstadoLead = (typeof ESTADOS_LEAD)[number];

export const TIPOLOGIAS = [
  "1 ambiente",
  "2 ambientes",
  "3 ambientes",
  "duplex",
  "local",
] as const;
export type Tipologia = (typeof TIPOLOGIAS)[number];

export const ORIENTACIONES = [
  "Norte",
  "Sur",
  "Este",
  "Oeste",
  "Noreste",
  "Noroeste",
  "Sureste",
  "Suroeste",
  "Frente",
  "Contrafrente",
] as const;

export const ESTADOS_COMISION = ["pendiente", "pagada"] as const;
export type EstadoComision = (typeof ESTADOS_COMISION)[number];
