// Overlays de unidades: polígonos rectos "M x y L x y ... Z" sobre el
// viewBox de la imagen (coordenadas en píxeles naturales de la foto).
export type Point = { x: number; y: number };

export function parsePolygonPath(d: string): Point[] {
  const numeros = d.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
  const puntos: Point[] = [];
  for (let i = 0; i + 1 < numeros.length; i += 2) {
    puntos.push({ x: numeros[i], y: numeros[i + 1] });
  }
  return puntos;
}

export function serializePolygonPath(puntos: Point[]): string {
  if (puntos.length === 0) return "";
  const [primero, ...resto] = puntos;
  const segmentos = resto.map((p) => `L ${p.x} ${p.y}`).join(" ");
  return `M ${primero.x} ${primero.y} ${segmentos} Z`.trim();
}

export function centroide(puntos: Point[]): Point {
  const n = puntos.length || 1;
  const suma = puntos.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
  return { x: suma.x / n, y: suma.y / n };
}
