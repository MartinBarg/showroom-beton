import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: {
    default: "Washington 2346 — Showroom Virtual",
    template: "%s · Washington 2346",
  },
  description:
    "Showroom digital del proyecto Washington 2346 en Belgrano: unidades de 1 a 3 ambientes, dúplex y local comercial. Explorá planos, galerías y tours 360.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
