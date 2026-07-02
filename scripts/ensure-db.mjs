// Si la base SQLite local no existe todavía, la crea (prisma db push) y la
// puebla con el seed. Así `npm run dev` alcanza para tener el showroom
// completo navegable, sin pasos manuales.
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dbPath = join(root, "prisma", "dev.db");

if (!existsSync(dbPath)) {
  console.log("[setup] Base de datos local no encontrada. Creando y seedeando...");
  execSync("npx prisma db push --skip-generate", { cwd: root, stdio: "inherit" });
  execSync("npx prisma db seed", { cwd: root, stdio: "inherit" });
  console.log("[setup] Base lista.");
}
