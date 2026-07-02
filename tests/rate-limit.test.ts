import { beforeEach, describe, expect, it } from "vitest";
import {
  _reset,
  BLOQUEO_MS,
  estaBloqueado,
  MAX_INTENTOS,
  registrarExito,
  registrarFallo,
} from "@/lib/rate-limit";

describe("rate limiting de login", () => {
  beforeEach(() => _reset());

  it("no bloquea con menos de 5 intentos fallidos", () => {
    for (let i = 0; i < MAX_INTENTOS - 1; i++) registrarFallo("1.2.3.4");
    expect(estaBloqueado("1.2.3.4")).toBe(false);
  });

  it("bloquea al quinto intento fallido", () => {
    for (let i = 0; i < MAX_INTENTOS; i++) registrarFallo("1.2.3.4");
    expect(estaBloqueado("1.2.3.4")).toBe(true);
  });

  it("el bloqueo es por IP, no global", () => {
    for (let i = 0; i < MAX_INTENTOS; i++) registrarFallo("1.2.3.4");
    expect(estaBloqueado("5.6.7.8")).toBe(false);
  });

  it("se desbloquea automáticamente pasados los 15 minutos", () => {
    const ahora = Date.now();
    for (let i = 0; i < MAX_INTENTOS; i++) registrarFallo("1.2.3.4", ahora);
    expect(estaBloqueado("1.2.3.4", ahora + BLOQUEO_MS - 1)).toBe(true);
    expect(estaBloqueado("1.2.3.4", ahora + BLOQUEO_MS)).toBe(false);
  });

  it("un login exitoso resetea el contador de fallos", () => {
    for (let i = 0; i < MAX_INTENTOS - 1; i++) registrarFallo("1.2.3.4");
    registrarExito("1.2.3.4");
    for (let i = 0; i < MAX_INTENTOS - 1; i++) registrarFallo("1.2.3.4");
    expect(estaBloqueado("1.2.3.4")).toBe(false);
  });
});
