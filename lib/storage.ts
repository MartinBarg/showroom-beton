// Storage de archivos: Cloudflare R2 en producción, URLs placeholder en dev.
// Si las credenciales de R2 del env son placeholders, no se sube nada y se
// devuelve una URL de picsum.photos determinística según la key.
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { esPlaceholder } from "./utils";

export function r2Configurado(): boolean {
  return (
    !esPlaceholder(process.env.R2_ACCESS_KEY_ID) &&
    !esPlaceholder(process.env.R2_SECRET_ACCESS_KEY) &&
    !esPlaceholder(process.env.R2_ENDPOINT) &&
    !esPlaceholder(process.env.R2_BUCKET_NAME) &&
    !esPlaceholder(process.env.R2_PUBLIC_URL)
  );
}

let cliente: S3Client | null = null;

function clienteR2(): S3Client {
  if (!cliente) {
    cliente = new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT!,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return cliente;
}

export function urlPlaceholder(seed: string, ancho = 1600, alto = 1000): string {
  const limpio = seed.replace(/[^a-zA-Z0-9-]/g, "-");
  return `https://picsum.photos/seed/${limpio}/${ancho}/${alto}`;
}

/**
 * Sube un archivo y devuelve su URL pública.
 * Sin credenciales reales de R2, devuelve una URL placeholder (no sube nada)
 * para que el flujo completo del panel interno funcione en local.
 */
export async function subirArchivo(
  contenido: Buffer,
  key: string,
  contentType: string
): Promise<{ url: string; simulado: boolean }> {
  if (!r2Configurado()) {
    console.log(`[STORAGE MOCK] Subida simulada de "${key}" (${contentType}, ${contenido.length} bytes)`);
    return { url: urlPlaceholder(key), simulado: true };
  }

  await clienteR2().send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: contenido,
      ContentType: contentType,
    })
  );
  return { url: `${process.env.R2_PUBLIC_URL!.replace(/\/$/, "")}/${key}`, simulado: false };
}
