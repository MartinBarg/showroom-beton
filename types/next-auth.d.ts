import type { DefaultSession } from "next-auth";
import type { Rol } from "@/lib/types";

declare module "next-auth" {
  interface User {
    id: string;
    rol: Rol;
    agenciaId: string | null;
  }

  interface Session {
    user: {
      id: string;
      rol: Rol;
      agenciaId: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    rol?: Rol;
    agenciaId?: string | null;
  }
}
