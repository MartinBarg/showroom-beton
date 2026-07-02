import { prisma } from "@/lib/prisma";
import { HeroLanding } from "@/components/public/hero-landing";

export default async function LandingPage() {
  const proyecto = await prisma.proyecto.findFirst({ where: { activo: true } });
  const vistaInicial = proyecto
    ? await prisma.vistaExterior.findFirst({
        where: { proyectoId: proyecto.id, esVistaInicial: true },
      })
    : null;

  return (
    <main>
      <HeroLanding
        nombre={proyecto?.nombre ?? "Washington 2346"}
        tagline={
          proyecto?.descripcion.split(". ")[0] ??
          "Un edificio pensado para vivir Belgrano con otra perspectiva."
        }
        imagenUrl={vistaInicial?.imagenUrl ?? "https://picsum.photos/seed/fachada-norte/1920/1080"}
      />
    </main>
  );
}
