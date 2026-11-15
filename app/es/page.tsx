import type { Metadata } from "next";
import { LocalizedHome } from "@/app/page";

export const metadata: Metadata = {
  title: "brasa · Pantanal brasileño",
  description: "Historial de ocurrencias de fuego en el Pantanal brasileño.",
  alternates: {
    canonical: "/es",
    languages: {
      en: "/",
      "pt-BR": "/pt-br",
      es: "/es",
    },
  },
};

export default function SpanishHome() {
  return <LocalizedHome locale="es" />;
}
