import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { estaBloqueado, registrarExito, registrarFallo } from "./rate-limit";
import type { Rol } from "./types";

function obtenerIp(headers: Record<string, unknown> | undefined): string {
  const xff = headers?.["x-forwarded-for"];
  if (typeof xff === "string" && xff.length > 0) return xff.split(",")[0].trim();
  return "local";
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // JWT expira a las 24 hs (sección 8 del plan)
  },
  pages: { signIn: "/admin/login" },
  providers: [
    CredentialsProvider({
      name: "credenciales",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials, req) {
        const ip = obtenerIp(req?.headers);
        if (estaBloqueado(ip)) {
          // El mensaje viaja como ?error= en la página de login
          throw new Error("BLOQUEADO");
        }

        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;
        if (!email || !password) return null;

        const usuario = await prisma.usuario.findUnique({ where: { email } });
        if (!usuario || !usuario.activo) {
          registrarFallo(ip);
          return null;
        }

        const passwordOk = await bcrypt.compare(password, usuario.passwordHash);
        if (!passwordOk) {
          registrarFallo(ip);
          return null;
        }

        registrarExito(ip);
        await prisma.usuario.update({
          where: { id: usuario.id },
          data: { ultimoLogin: new Date() },
        });

        return {
          id: usuario.id,
          name: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol as Rol,
          agenciaId: usuario.agenciaId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.rol = user.rol;
        token.agenciaId = user.agenciaId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid ?? "";
        session.user.rol = (token.rol ?? "AGENCIA") as Rol;
        session.user.agenciaId = token.agenciaId ?? null;
      }
      return session;
    },
  },
};
