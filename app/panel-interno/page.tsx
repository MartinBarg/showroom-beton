import { redirect } from "next/navigation";

// El middleware ya redirige a "/" si el rol no es OWNER
export default function PanelInternoIndexPage() {
  redirect("/panel-interno/proyecto");
}
