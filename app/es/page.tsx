import type { Metadata } from "next";
import { LocalizedHome } from "@/app/page";

export const metadata: Metadata = {
  title: "brasa · Pantanal brasileño",
  description: "Historial de días con fuego en el Pantanal brasileño.",
};

export default function SpanishHome() {
  return <LocalizedHome locale="es" />;
}
