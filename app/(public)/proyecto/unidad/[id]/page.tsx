import { redirect } from "next/navigation";

// La ficha de unidad siempre arranca en el plano (sección 3 del plan)
export default function UnidadIndexPage({ params }: { params: { id: string } }) {
  redirect(`/proyecto/unidad/${params.id}/plano`);
}
