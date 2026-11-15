import type { Metadata } from "next";
import { LocalizedHome } from "@/app/page";

export const metadata: Metadata = {
  title: "brasa · Pantanal brasileiro",
  description: "Histórico de dias com fogo no Pantanal brasileiro.",
};

export default function PortugueseHome() {
  return <LocalizedHome locale="pt-BR" />;
}
