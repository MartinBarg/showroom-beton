// Copia .env.example a .env si no existe, para que `npm install && npm run dev`
// funcione sin configuración manual (todo placeholder-first).
import { copyFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env");
const examplePath = join(root, ".env.example");

if (!existsSync(envPath) && existsSync(examplePath)) {
  copyFileSync(examplePath, envPath);
  console.log("[setup] .env creado a partir de .env.example (valores placeholder)");
}
