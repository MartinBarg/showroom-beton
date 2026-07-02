import { redirect } from "next/navigation";

// El middleware ya redirige a /admin/login si no hay sesión
export default function AdminIndexPage() {
  redirect("/admin/dashboard");
}
