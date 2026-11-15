import type { Metadata } from "next";
import { LocalizedHome } from "@/app/page";

export const metadata: Metadata = {
  title: "brasa · Brazilian Pantanal",
  description: "Fire occurrence history in the Brazilian Pantanal.",
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      "pt-BR": "/pt-br",
      es: "/es",
    },
  },
};

export default function EnglishHome() {
  return <LocalizedHome locale="en" />;
}
