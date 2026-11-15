// AI-assisted: generated with Claude (Anthropic) and reviewed by the Brasa team.
// Formatting helpers and shared visual constants.

import type { Locale } from "@/lib/types";

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
export const MONTHS_PT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
export const MONTHS_LONG_PT = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

export const fmt = (v: number, locale: Locale = "en") =>
  new Intl.NumberFormat(locale === "pt-BR" ? "pt-BR" : "en-US", { maximumFractionDigits: 1 }).format(v);
export const fmt0 = (v: number, locale: Locale = "en") =>
  new Intl.NumberFormat(locale === "pt-BR" ? "pt-BR" : "en-US", { maximumFractionDigits: 0 }).format(v);

export const monthLabel = (year: number, month: number, locale: Locale = "en") =>
  `${(locale === "pt-BR" ? MONTHS_PT : MONTHS)[month - 1]} ${year}`;

export const formatDate = (iso: string, locale: Locale = "en") =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(locale === "pt-BR" ? "pt-BR" : "en-US", { day: "2-digit", month: "short", year: "numeric" });

// Brand
export const BRAND = {
  orange: "#A63C16",
  leaf: "#4E6B2C",
  ink: "#1C1A17",
  ground: "#F6F5F2",
  blue: "#2B6CB0", // "below normal" side of the diverging scale
  grey: "#A8A29E",
};

// Viridis, 5 stops (colour-blind safe), for counts
export const VIRIDIS = ["#440154", "#3b528b", "#21918c", "#5ec962", "#fde725"];
