// Google Maps con fallback: si la API key es placeholder, /ubicacion muestra
// un mapa estático de reemplazo sin romper la página (sección 6 del plan).
import { esPlaceholder } from "./utils";

export function googleMapsApiKey(): string | null {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  return esPlaceholder(key) ? null : key!;
}

// Puntos de interés cercanos al edificio (contenido placeholder editable)
export const PUNTOS_DE_INTERES = [
  { categoria: "Transporte", nombre: "Estación Belgrano C (Tren Mitre)", distancia: "400 m" },
  { categoria: "Transporte", nombre: "Subte Línea D — Est. Congreso de Tucumán", distancia: "650 m" },
  { categoria: "Comercios", nombre: "Av. Cabildo (zona comercial)", distancia: "300 m" },
  { categoria: "Comercios", nombre: "Barrio Chino", distancia: "550 m" },
  { categoria: "Educación", nombre: "Universidad de Belgrano", distancia: "900 m" },
  { categoria: "Educación", nombre: "Colegio San Román", distancia: "500 m" },
  { categoria: "Salud", nombre: "Hospital Pirovano", distancia: "1,2 km" },
  { categoria: "Salud", nombre: "Clínica Olivos (sede Belgrano)", distancia: "800 m" },
] as const;
