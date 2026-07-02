import { NextResponse } from "next/server";
import { requireApiRol } from "@/lib/api-guard";
import { subirArchivo } from "@/lib/storage";

// Subida de archivos del panel interno. Con credenciales R2 reales sube al
// bucket; con placeholders devuelve una URL de picsum (ver lib/storage.ts).
export async function POST(req: Request) {
  const guard = await requireApiRol(["OWNER"]);
  if (guard.error) return guard.error;

  const formData = await req.formData().catch(() => null);
  const archivo = formData?.get("archivo");
  if (!archivo || !(archivo instanceof File)) {
    return NextResponse.json({ error: "Falta el archivo" }, { status: 400 });
  }
  if (archivo.size > 25 * 1024 * 1024) {
    return NextResponse.json({ error: "Máximo 25 MB" }, { status: 400 });
  }

  const buffer = Buffer.from(await archivo.arrayBuffer());
  const nombreLimpio = archivo.name.replace(/[^a-zA-Z0-9.-]/g, "-");
  const key = `uploads/${Date.now()}-${nombreLimpio}`;

  const resultado = await subirArchivo(buffer, key, archivo.type || "application/octet-stream");
  return NextResponse.json({ ok: true, ...resultado });
}
