# Notas para revisión — MVP Washington 2346

Todo lo listado acá son supuestos y placeholders que tomé para poder construir el
MVP de punta a punta sin intervención humana (regla 1 del plan ejecutable). Cada
ítem indica qué habría que reemplazar antes de ir a producción.

## Cómo levantar el proyecto

```bash
npm install    # crea .env desde .env.example y genera el cliente de Prisma
npm run dev    # si no existe prisma/dev.db, la crea y corre el seed solo
```

Con eso el showroom completo queda navegable en `http://localhost:3000` sin
crear ninguna cuenta externa. Comandos útiles:

- `npm run db:setup` — recrear base + seed a mano.
- `npm run test` / `npm run typecheck` / `npm run lint` / `npm run build`.

## Credenciales de prueba (seed)

| Rol | Email | Contraseña |
|---|---|---|
| OWNER (acceso total) | `owner@showroom.local` | `Owner!2346` |
| DESARROLLADOR | `desarrollador@showroom.local` | `Desarrollador!2346` |
| AGENCIA (Inmobiliaria Norte) | `agencia.norte@showroom.local` | `Agencia!2346` |
| AGENCIA (Propiedades del Sur) | `agencia.sur@showroom.local` | `Agencia!2346` |

Login único para todos los roles: `/admin/login`. El panel `/admin` muestra las
secciones según el rol (el OWNER ve todo; el DESARROLLADOR, lo comercial; la
AGENCIA, solo su dashboard y sus leads).

**Cambiar las cuatro contraseñas antes de producción** (reset desde
`/admin/usuarios`; la cuenta OWNER se cambia regenerando el seed o
directo en la base, porque la API bloquea modificar cuentas OWNER a propósito
para evitar lockouts).

## Supuestos y placeholders tomados

### Base de datos
- **SQLite local** (`prisma/dev.db`) para que todo funcione sin cuentas. Para
  producción: en `prisma/schema.prisma` cambiar `provider = "sqlite"` a
  `postgresql`, apuntar `DATABASE_URL` a Supabase y correr `prisma migrate dev`.
- SQLite no soporta enums ni arrays: `rol`, `estado`, `tipologia` son `String`
  validados con zod/constantes de `lib/types.ts`, y `galeria`/`imagenes` son
  `String` con JSON (`parseJsonArray` en `lib/utils.ts`). Al migrar a Postgres
  se pueden convertir a enums/arrays nativos si se quiere (opcional, funciona
  igual como está).

### Contenido
- **Todas las imágenes** (renders, planos, fachadas, galería, obra) son
  `picsum.photos` / `placehold.co` seedeadas. Se reemplazan desde
  `/admin/contenido-unidades` y `/admin/vistas-exterior`.
- **Tours 360**: el seed deja `tourKuulaUrl = null` en todas las unidades, así
  la pestaña Tour 360 muestra el placeholder "reemplazar con URL de Kuula" en
  vez de un iframe roto apuntando a una demo que podría desaparecer. Cargar las
  URLs reales de Kuula desde el panel interno (el iframe ya está implementado).
- **Videos de transición entre vistas**: el seed no incluye mp4 (no hay stock
  liviano confiable que embeber); las 6 transiciones existen con `videoUrl =
  null` y el frontend hace **crossfade CSS** como fallback (opción prevista en
  la sección 7 del plan). Al cargar un mp4 real desde el panel interno, la
  transición pasa a usar el video automáticamente (`onEnded` → imagen nueva).
- **Overlays SVG**: polígonos rectangulares de ejemplo en grilla sobre un
  viewBox de 1600×1000 (Fachada Norte: unidades x01/x02 + local; Fachada Sur:
  x03/x04; Vista Aérea: local). Cuando estén los renders reales hay que
  redibujar los paths reales desde `/admin/vistas-exterior` (mismo viewBox).
- Textos de descripción de unidades, puntos de interés de `/ubicacion`
  (`lib/maps.ts`), datos de contacto del desarrollador y textos legales del
  footer/contacto son **placeholder marcados como tales**.
- Lat/lng del proyecto: aproximados para Washington 2346, Belgrano (CABA).
  Ajustar desde `/admin/proyecto`.

### Servicios externos (todos con fallback local)
| Servicio | Comportamiento con placeholder | Para activar el real |
|---|---|---|
| Resend | Loguea `[EMAIL MOCK] Nuevo lead: ...` en consola | `RESEND_API_KEY` + `RESEND_FROM_EMAIL` verificado |
| Cloudflare R2 | `/api/upload` devuelve URL de picsum sin subir nada (avisa en la UI) | Las 5 vars `R2_*` en `.env` |
| Google Maps | `/ubicacion` muestra imagen estática + aviso | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (Embed API) |
| WhatsApp | Botón apunta a `5491100000000` | `NEXT_PUBLIC_WHATSAPP_NUMBER` real |
| Vercel Analytics | Integrado; solo reporta deployado en Vercel | Nada extra |

### Decisiones de implementación
- **"Ventas en el tiempo"** (dashboard): el modelo no guarda fecha de venta por
  unidad, así que la serie temporal usa las **comisiones** (`fechaPago` si
  existe, si no `creadoEn`) como registro de las operaciones. Si querés la
  serie exacta por unidad habría que agregar un campo `fechaVenta` a `unidad`.
- **Rate limiting** de login: in-memory (5 fallos/IP → 15 min de bloqueo, con
  desbloqueo automático). Vale para una sola instancia (dev/Vercel región
  única); si escala a múltiples instancias, moverlo a Redis/Upstash.
- **Mobile en `/proyecto`**: 1er tap resalta el polígono, 2do tap abre el
  preview (con mouse: hover resalta + click abre), como pide la sección 4.
- Las cuentas **AGENCIA** solo pueden mover sus propios leads de columna y no
  pueden reasignar agencia (validado server-side en `/api/leads/[id]`).
- Desactivar una agencia desde `/admin/agencias` también desactiva el login de
  sus cuentas.
- Al pasar una unidad a `disponible`, el backend limpia la agencia asignada.
- Seguridad según sección 8: bcrypt salt 12, JWT de 24 hs, middleware sobre
  `/admin/*` + validación de rol repetida en cada API y en cada layout
  (defensa en profundidad). El acceso por rol vive en `lib/rbac.ts`
  (`evaluarAcceso`, testeada rol×ruta): contenido solo-OWNER, comercial
  OWNER+DESARROLLADOR, dashboard/leads todos los roles.
- El lead de prueba "Prueba Smoke" puede aparecer en tu base local si corriste
  el smoke test; la base `dev.db` está gitignoreada, no viaja en el repo.

## Checklist antes de producción

1. Crear Supabase (Postgres), cambiar provider/`DATABASE_URL`, correr
   migraciones y el seed real (o cargar contenido desde el panel interno).
2. Crear cuentas de Cloudflare R2, Resend y Google Maps; cargar las env vars en
   Vercel.
3. Reemplazar imágenes, tours Kuula, videos de transición y overlays reales
   desde `/admin` (secciones Contenido de unidades y Vistas exterior).
4. Cambiar el número real de WhatsApp, datos de contacto y textos legales.
5. Cambiar `NEXTAUTH_SECRET` por uno aleatorio fuerte y rotar las 4 contraseñas
   del seed.
6. Ajustar la cantidad real de pisos/unidades del edificio.
7. Revisar y mergear el PR (lo hace el usuario, no el agente).

## QA ejecutado

- `npm run typecheck` ✅ sin errores
- `npm run lint` ✅ sin warnings
- `npm run test` ✅ 28/28 (RBAC rol×ruta, métricas/comisiones, rate limiting)
- `npm run build` ✅ sin errores
- Smoke test HTTP sobre build de producción: rutas públicas 200, `/admin` sin
  sesión → 307 a `/admin/login`, `POST /api/leads` crea lead y loguea el email
  mock ✅
