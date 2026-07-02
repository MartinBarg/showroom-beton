// Rate limiting de login: 5 intentos fallidos por IP → bloqueo 15 minutos,
// desbloqueo automático (sección 8 del plan).
//
// Implementación in-memory: suficiente para una sola instancia (dev y el
// deploy inicial en Vercel con una región). Si el proyecto escala a múltiples
// instancias, mover a Redis/Upstash — la interfaz queda igual.

export const MAX_INTENTOS = 5;
export const BLOQUEO_MS = 15 * 60 * 1000;

type Registro = { fallos: number; bloqueadoHasta: number | null };

const intentos = new Map<string, Registro>();

export function estaBloqueado(clave: string, ahora: number = Date.now()): boolean {
  const registro = intentos.get(clave);
  if (!registro?.bloqueadoHasta) return false;
  if (ahora >= registro.bloqueadoHasta) {
    // Desbloqueo automático
    intentos.delete(clave);
    return false;
  }
  return true;
}

export function registrarFallo(clave: string, ahora: number = Date.now()): void {
  const registro = intentos.get(clave) ?? { fallos: 0, bloqueadoHasta: null };
  registro.fallos += 1;
  if (registro.fallos >= MAX_INTENTOS) {
    registro.bloqueadoHasta = ahora + BLOQUEO_MS;
  }
  intentos.set(clave, registro);
}

export function registrarExito(clave: string): void {
  intentos.delete(clave);
}

// Solo para tests
export function _reset(): void {
  intentos.clear();
}
