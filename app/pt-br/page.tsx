import type { Metadata } from "next";
import { LocalizedHome } from "@/app/page";

export const metadata: Metadata = {
  title: "brasa · Pantanal brasileiro",
  description: "Histórico de ocorrências de fogo no Pantanal brasileiro.",
  alternates: {
    canonical: "/pt-br",
    languages: {
      en: "/",
      "pt-BR": "/pt-br",
      es: "/es",
    },
  },
};

export default function PortugueseHome() {
  return <LocalizedHome locale="pt-BR" />;
}
