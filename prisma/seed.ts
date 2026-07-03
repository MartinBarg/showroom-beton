import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

// URLs placeholder — ver NOTAS-PARA-REVISION.md
const img = (seed: string, w = 1600, h = 1000) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;
const plano = (numero: string) =>
  `https://placehold.co/1200x900/f5f5f4/57534e/png?text=Plano+${encodeURIComponent(numero)}`;

type UnidadSeed = {
  numero: string;
  tipologia: string;
  supTotal: number;
  supCubierta: number;
  orientacion: string;
  precio: number;
  estado: "disponible" | "reservada" | "vendida";
  agencia?: 0 | 1; // índice de agencia si está reservada/vendida
  destacada?: boolean;
};

async function main() {
  const existente = await prisma.proyecto.findFirst();
  if (existente) {
    console.log("[seed] La base ya tiene datos, no se re-seedea.");
    return;
  }

  console.log("[seed] Creando proyecto Washington 2346...");

  const proyecto = await prisma.proyecto.create({
    data: {
      nombre: "Washington 2346",
      descripcion:
        "Edificio residencial en pozo de 6 niveles en el corazón de Belgrano. " +
        "Unidades de 1 a 3 ambientes con terminaciones premium, amenities en " +
        "terraza y local comercial a la calle. Entrega estimada: diciembre 2027.",
      ubicacion: "Washington 2346, Belgrano, Ciudad de Buenos Aires",
      lat: -34.5578,
      lng: -58.4632,
      fechaEntrega: new Date("2027-12-01"),
      cantidadPisos: 6,
      activo: true,
    },
  });

  // ---------------------------------------------------------------- Agencias
  const agenciaNorte = await prisma.agencia.create({
    data: {
      nombre: "Inmobiliaria Norte",
      email: "contacto@inmobiliarianorte.local",
      telefono: "+54 11 4780-1234",
      activa: true,
    },
  });
  const agenciaSur = await prisma.agencia.create({
    data: {
      nombre: "Propiedades del Sur",
      email: "info@propiedadesdelsur.local",
      telefono: "+54 11 4300-5678",
      activa: true,
    },
  });
  const agencias = [agenciaNorte, agenciaSur];

  // ---------------------------------------------------------------- Usuarios
  // Credenciales de desarrollo — documentadas en NOTAS-PARA-REVISION.md
  await prisma.usuario.create({
    data: {
      nombre: "Owner Técnico",
      email: "owner@showroom.local",
      passwordHash: await bcrypt.hash("Owner!2346", SALT_ROUNDS),
      rol: "OWNER",
      activo: true,
    },
  });
  await prisma.usuario.create({
    data: {
      nombre: "Martín Desarrollador",
      email: "desarrollador@showroom.local",
      passwordHash: await bcrypt.hash("Desarrollador!2346", SALT_ROUNDS),
      rol: "DESARROLLADOR",
      activo: true,
    },
  });
  await prisma.usuario.create({
    data: {
      nombre: "Cuenta Inmobiliaria Norte",
      email: "agencia.norte@showroom.local",
      passwordHash: await bcrypt.hash("Agencia!2346", SALT_ROUNDS),
      rol: "AGENCIA",
      agenciaId: agenciaNorte.id,
      activo: true,
    },
  });
  await prisma.usuario.create({
    data: {
      nombre: "Cuenta Propiedades del Sur",
      email: "agencia.sur@showroom.local",
      passwordHash: await bcrypt.hash("Agencia!2346", SALT_ROUNDS),
      rol: "AGENCIA",
      agenciaId: agenciaSur.id,
      activo: true,
    },
  });

  // ---------------------------------------------------------- Pisos/Unidades
  const unidadesPorPiso: Record<number, UnidadSeed[]> = {
    1: [
      { numero: "101", tipologia: "1 ambiente", supTotal: 42, supCubierta: 38, orientacion: "Norte", precio: 98000, estado: "disponible" },
      { numero: "102", tipologia: "2 ambientes", supTotal: 61, supCubierta: 54, orientacion: "Este", precio: 142000, estado: "reservada", agencia: 0 },
      { numero: "103", tipologia: "2 ambientes", supTotal: 63, supCubierta: 55, orientacion: "Oeste", precio: 146000, estado: "disponible" },
      { numero: "104", tipologia: "3 ambientes", supTotal: 88, supCubierta: 76, orientacion: "Norte", precio: 205000, estado: "vendida", agencia: 1 },
    ],
    2: [
      { numero: "201", tipologia: "1 ambiente", supTotal: 42, supCubierta: 38, orientacion: "Norte", precio: 101000, estado: "disponible" },
      { numero: "202", tipologia: "2 ambientes", supTotal: 61, supCubierta: 54, orientacion: "Este", precio: 147000, estado: "disponible" },
      { numero: "203", tipologia: "2 ambientes", supTotal: 63, supCubierta: 55, orientacion: "Oeste", precio: 151000, estado: "disponible" },
      { numero: "204", tipologia: "3 ambientes", supTotal: 88, supCubierta: 76, orientacion: "Norte", precio: 212000, estado: "reservada", agencia: 0 },
    ],
    3: [
      { numero: "301", tipologia: "1 ambiente", supTotal: 42, supCubierta: 38, orientacion: "Norte", precio: 104000, estado: "vendida", agencia: 0 },
      { numero: "302", tipologia: "2 ambientes", supTotal: 61, supCubierta: 54, orientacion: "Este", precio: 152000, estado: "disponible" },
      { numero: "303", tipologia: "2 ambientes", supTotal: 63, supCubierta: 55, orientacion: "Oeste", precio: 156000, estado: "disponible" },
      { numero: "304", tipologia: "3 ambientes", supTotal: 88, supCubierta: 76, orientacion: "Norte", precio: 219000, estado: "disponible", destacada: true },
    ],
    4: [
      { numero: "401", tipologia: "1 ambiente", supTotal: 42, supCubierta: 38, orientacion: "Norte", precio: 107000, estado: "disponible" },
      { numero: "402", tipologia: "2 ambientes", supTotal: 61, supCubierta: 54, orientacion: "Este", precio: 157000, estado: "disponible" },
      { numero: "403", tipologia: "3 ambientes", supTotal: 90, supCubierta: 78, orientacion: "Noroeste", precio: 228000, estado: "reservada", agencia: 1 },
      { numero: "404", tipologia: "3 ambientes", supTotal: 92, supCubierta: 79, orientacion: "Norte", precio: 233000, estado: "disponible" },
    ],
    5: [
      { numero: "501", tipologia: "2 ambientes", supTotal: 65, supCubierta: 56, orientacion: "Norte", precio: 168000, estado: "disponible" },
      { numero: "502", tipologia: "2 ambientes", supTotal: 66, supCubierta: 57, orientacion: "Este", precio: 171000, estado: "disponible" },
      { numero: "503", tipologia: "duplex", supTotal: 128, supCubierta: 104, orientacion: "Norte", precio: 340000, estado: "disponible", destacada: true },
      { numero: "504", tipologia: "duplex", supTotal: 122, supCubierta: 99, orientacion: "Oeste", precio: 328000, estado: "vendida", agencia: 1 },
    ],
  };

  const unidades: { id: string; numero: string }[] = [];
  for (const [numeroPiso, defs] of Object.entries(unidadesPorPiso)) {
    const n = Number(numeroPiso);
    const piso = await prisma.piso.create({
      data: { proyectoId: proyecto.id, numero: n, orden: n },
    });
    for (const def of defs) {
      const unidad = await prisma.unidad.create({
        data: {
          pisoId: piso.id,
          numero: def.numero,
          tipologia: def.tipologia,
          superficieTotal: def.supTotal,
          superficieCubierta: def.supCubierta,
          superficieDescubierta: Math.round((def.supTotal - def.supCubierta) * 10) / 10,
          orientacion: def.orientacion,
          precio: def.precio,
          estado: def.estado,
          agenciaId: def.agencia !== undefined ? agencias[def.agencia].id : null,
          destacada: def.destacada ?? false,
          renderUrl: img(`unidad-${def.numero}-render`),
          planoUrl: plano(def.numero),
          galeria: JSON.stringify([
            img(`unidad-${def.numero}-g1`, 1200, 800),
            img(`unidad-${def.numero}-g2`, 1200, 800),
            img(`unidad-${def.numero}-g3`, 1200, 800),
            img(`unidad-${def.numero}-g4`, 1200, 800),
          ]),
          // Placeholder: la página muestra un aviso "reemplazar con URL de
          // Kuula" cuando es null. Se carga la real desde /panel-interno.
          tourKuulaUrl: null,
          descripcion: `Unidad ${def.numero} de ${def.tipologia} con orientación ${def.orientacion.toLowerCase()}. Terminaciones premium, pisos de porcelanato, carpinterías de aluminio con DVH y calefacción por radiadores. Placeholder de descripción real.`,
        },
      });
      unidades.push({ id: unidad.id, numero: def.numero });
    }
  }

  // Piso 0 = planta baja con el local comercial
  const plantaBaja = await prisma.piso.create({
    data: { proyectoId: proyecto.id, numero: 0, orden: 0 },
  });
  const local = await prisma.unidad.create({
    data: {
      pisoId: plantaBaja.id,
      numero: "LC-1",
      tipologia: "local",
      superficieTotal: 145,
      superficieCubierta: 120,
      superficieDescubierta: 25,
      orientacion: "Frente",
      precio: 390000,
      estado: "disponible",
      esLocalComercial: true,
      renderUrl: img("local-comercial-render"),
      planoUrl: plano("LC-1"),
      galeria: JSON.stringify([
        img("local-comercial-g1", 1200, 800),
        img("local-comercial-g2", 1200, 800),
        img("local-comercial-g3", 1200, 800),
      ]),
      tourKuulaUrl: null,
      descripcion:
        "Local comercial a la calle con doble altura, vidriera de 8 metros " +
        "sobre Washington y acceso independiente. Apto gastronomía y retail. " +
        "Superficie descubierta como patio de servicio. Placeholder de descripción real.",
    },
  });
  unidades.push({ id: local.id, numero: "LC-1" });

  // --------------------------------------------------------- Vistas exterior
  const vistaNorte = await prisma.vistaExterior.create({
    data: {
      proyectoId: proyecto.id,
      nombre: "Vista Frontal",
      imagenUrl: "/images/vista-frontal.png",
      orden: 1,
      esVistaInicial: true,
    },
  });
  const vistaSur = await prisma.vistaExterior.create({
    data: {
      proyectoId: proyecto.id,
      nombre: "Vista Lateral",
      imagenUrl: "/images/vista-lateral.png",
      orden: 2,
    },
  });

  // Sin overlays de ejemplo: se dibujan a mano sobre la foto real desde
  // /panel-interno/vistas-exterior (editor visual de polígonos).
  const porNumero = new Map(unidades.map((u) => [u.numero, u.id]));

  // Transiciones entre todas las vistas. videoUrl null = el frontend usa
  // crossfade CSS (fallback documentado). Cargar mp4 reales en /panel-interno.
  const vistas = [vistaNorte, vistaSur];
  for (const origen of vistas) {
    for (const destino of vistas) {
      if (origen.id === destino.id) continue;
      await prisma.transicionVista.create({
        data: {
          vistaOrigenId: origen.id,
          vistaDestinoId: destino.id,
          videoUrl: null,
        },
      });
    }
  }

  // -------------------------------------------------------------------- Leads
  const leadsSeed: Array<{
    nombre: string;
    email: string;
    telefono?: string;
    mensaje?: string;
    estado: string;
    unidad?: string;
    agencia?: 0 | 1;
  }> = [
    { nombre: "Julia Fernández", email: "julia.f@example.com", telefono: "+54 9 11 5555-0101", mensaje: "Hola, quisiera saber el precio de lista del 2 ambientes del 3er piso.", estado: "Lead", unidad: "302" },
    { nombre: "Marcos Petti", email: "marcos.petti@example.com", telefono: "+54 9 11 5555-0102", mensaje: "¿Tienen financiación en pesos?", estado: "Lead" },
    { nombre: "Carla Domínguez", email: "carla.d@example.com", telefono: "+54 9 11 5555-0103", mensaje: "Me interesa el dúplex con terraza.", estado: "Contactado", unidad: "503", agencia: 0 },
    { nombre: "Esteban Gutiérrez", email: "esteban.g@example.com", mensaje: "Consulto por el local comercial.", estado: "Contactado", unidad: "LC-1", agencia: 1 },
    { nombre: "Romina Salas", email: "romina.salas@example.com", telefono: "+54 9 11 5555-0105", estado: "Seguimiento", unidad: "304", agencia: 0 },
    { nombre: "Federico Lanza", email: "fede.lanza@example.com", telefono: "+54 9 11 5555-0106", mensaje: "Quiero coordinar una visita al showroom.", estado: "Seguimiento", agencia: 1 },
    { nombre: "Verónica Ámbito", email: "vero.ambito@example.com", estado: "Reserva", unidad: "403", agencia: 1 },
    { nombre: "Grupo Inversor Sur", email: "inversiones@gruposur.example.com", telefono: "+54 9 11 5555-0108", mensaje: "Consultamos por 2 unidades para inversión.", estado: "Standby", agencia: 1 },
    { nombre: "Lucía Bermani", email: "lucia.b@example.com", telefono: "+54 9 11 5555-0109", estado: "Won", unidad: "504", agencia: 1 },
    { nombre: "Pedro Aguirre", email: "pedro.a@example.com", mensaje: "Ya compré en otro proyecto, gracias.", estado: "Lost", agencia: 0 },
  ];
  for (const l of leadsSeed) {
    await prisma.lead.create({
      data: {
        nombre: l.nombre,
        email: l.email,
        telefono: l.telefono ?? null,
        mensaje: l.mensaje ?? null,
        estado: l.estado,
        unidadId: l.unidad ? porNumero.get(l.unidad) ?? null : null,
        agenciaId: l.agencia !== undefined ? agencias[l.agencia].id : null,
      },
    });
  }

  // --------------------------------------------------------------- Comisiones
  const comisionesSeed: Array<{
    agencia: 0 | 1;
    unidad?: string;
    concepto: string;
    monto: number;
    estado: "pendiente" | "pagada";
    fechaPago?: string;
  }> = [
    { agencia: 1, unidad: "104", concepto: "Comisión venta unidad 104", monto: 8200, estado: "pagada", fechaPago: "2026-03-10" },
    { agencia: 0, unidad: "301", concepto: "Comisión venta unidad 301", monto: 4160, estado: "pagada", fechaPago: "2026-04-22" },
    { agencia: 1, unidad: "504", concepto: "Comisión venta unidad 504", monto: 13120, estado: "pagada", fechaPago: "2026-06-05" },
    { agencia: 0, unidad: "102", concepto: "Comisión reserva unidad 102", monto: 2840, estado: "pendiente" },
    { agencia: 0, unidad: "204", concepto: "Comisión reserva unidad 204", monto: 4240, estado: "pendiente" },
    { agencia: 1, unidad: "403", concepto: "Comisión reserva unidad 403", monto: 4560, estado: "pendiente" },
  ];
  for (const c of comisionesSeed) {
    await prisma.comision.create({
      data: {
        agenciaId: agencias[c.agencia].id,
        unidadId: c.unidad ? porNumero.get(c.unidad) ?? null : null,
        concepto: c.concepto,
        monto: c.monto,
        estado: c.estado,
        fechaPago: c.fechaPago ? new Date(c.fechaPago) : null,
      },
    });
  }

  // ------------------------------------------------------------ Avance de obra
  const avances = [
    {
      titulo: "Inicio de excavación",
      descripcion:
        "Comenzaron los trabajos de excavación y submuración del terreno. " +
        "Se estima completar la etapa de fundaciones en 8 semanas.",
      fecha: "2026-02-15",
      seeds: ["obra-1a", "obra-1b", "obra-1c"],
    },
    {
      titulo: "Fundaciones terminadas",
      descripcion:
        "Finalizó el hormigonado de plateas y bases. La obra avanza según " +
        "cronograma hacia la estructura de planta baja.",
      fecha: "2026-04-08",
      seeds: ["obra-2a", "obra-2b", "obra-2c"],
    },
    {
      titulo: "Losa sobre planta baja",
      descripcion:
        "Se completó la losa sobre planta baja y arrancó la estructura del " +
        "primer piso. Avance general de obra: 18%.",
      fecha: "2026-05-20",
      seeds: ["obra-3a", "obra-3b"],
    },
    {
      titulo: "Estructura de 2º piso en ejecución",
      descripcion:
        "El encofrado del segundo nivel está en marcha. Se publicaron nuevas " +
        "fotos del avance tomadas con dron.",
      fecha: "2026-06-25",
      seeds: ["obra-4a", "obra-4b", "obra-4c", "obra-4d"],
    },
  ];
  for (const a of avances) {
    await prisma.avanceObra.create({
      data: {
        proyectoId: proyecto.id,
        titulo: a.titulo,
        descripcion: a.descripcion,
        imagenes: JSON.stringify(a.seeds.map((s) => img(s, 1200, 800))),
        fechaPublicacion: new Date(a.fecha),
      },
    });
  }

  // ------------------------------------------------------------------ Visitas
  // Distribución sesgada para que el ranking del dashboard tenga forma.
  const pesos: Array<[string, number]> = [
    ["503", 14],
    ["304", 11],
    ["104", 9],
    ["LC-1", 8],
    ["302", 6],
    ["403", 5],
    ["201", 4],
    ["102", 3],
  ];
  let visita = 0;
  for (const [numero, cantidad] of pesos) {
    const unidadId = porNumero.get(numero);
    if (!unidadId) continue;
    for (let i = 0; i < cantidad; i++) {
      visita++;
      await prisma.visita.create({
        data: {
          unidadId,
          sessionId: `seed-session-${(visita % 23) + 1}`,
          fecha: new Date(Date.now() - Math.floor(Math.random() * 45) * 86400000),
        },
      });
    }
  }
  // Visitas generales al showroom (sin unidad)
  for (let i = 0; i < 15; i++) {
    await prisma.visita.create({
      data: {
        sessionId: `seed-session-general-${i + 1}`,
        fecha: new Date(Date.now() - Math.floor(Math.random() * 45) * 86400000),
      },
    });
  }

  console.log("[seed] Listo: proyecto, 6 pisos, 21 unidades, 2 vistas, 10 leads, 6 comisiones, 4 avances de obra y visitas de ejemplo.");
  console.log("[seed] Credenciales de prueba en NOTAS-PARA-REVISION.md");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
