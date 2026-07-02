# Washington 2346 — Showroom Virtual

Showroom digital para la venta de departamentos en pozo del proyecto
**Washington 2346** (Belgrano, CABA). Incluye showroom público con fachada
interactiva, panel de gestión para el desarrollador y las agencias, y un panel
interno oculto para cargar contenido.

## Arranque rápido

```bash
npm install
npm run dev
```

Eso es todo: el `postinstall` copia `.env.example` a `.env` (valores
placeholder funcionales) y el `predev` crea la base SQLite local con datos de
ejemplo si no existe. El showroom queda navegable en
[http://localhost:3000](http://localhost:3000) sin cuentas externas.

Credenciales de prueba y lista completa de placeholders: ver
[NOTAS-PARA-REVISION.md](./NOTAS-PARA-REVISION.md).

## Secciones

- **Showroom público** (`/`): fachada interactiva con overlays SVG por unidad,
  fichas con plano/galería/tour 360, catálogo con filtros, avances de obra,
  ubicación y contacto (crea leads).
- **Admin cliente** (`/admin`): dashboard con KPIs y gráficos, kanban de leads
  con drag & drop, gestión de unidades, obra, pagos/comisiones y agencias.
  Roles `DESARROLLADOR` (todo) y `AGENCIA` (solo sus datos).
- **Panel interno** (`/panel-interno`): solo rol `OWNER`. Carga de contenido
  real (proyecto, vistas exteriores, transiciones, unidades) y gestión de
  cuentas.

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind · Prisma (SQLite en dev,
Postgres en prod) · NextAuth (credentials + JWT) · Framer Motion · Recharts ·
Vitest.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Dev server (auto-setea env y base si faltan) |
| `npm run db:setup` | Recrea la base local + seed |
| `npm run test` | Tests de RBAC, métricas y rate limiting |
| `npm run typecheck` / `npm run lint` | Chequeos estáticos |
| `npm run build` / `npm start` | Build y server de producción |
