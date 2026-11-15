// AI-assisted: generated with Claude (Anthropic) and reviewed by the Brasa team.
// Formatting helpers and shared visual constants.

export const LOCALE = "en-US"; // change to "pt-BR" if the UI goes Portuguese

const nf = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 1 });
const nf0 = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });

export const fmt = (v: number) => nf.format(v);
export const fmt0 = (v: number) => nf0.format(v);

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const monthLabel = (year: number, month: number) => `${MONTHS[month - 1]} ${year}`;

export const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(LOCALE, { day: "2-digit", month: "short", year: "numeric" });

// Brand
export const BRAND = {
  orange: "#D4501C",
  leaf: "#4E6B2C",
  ink: "#1C1A17",
  ground: "#F6F5F2",
  blue: "#2B6CB0", // "below normal" side of the diverging scale
  grey: "#A8A29E",
};

// Viridis, 5 stops (colour-blind safe), for counts
export const VIRIDIS = ["#440154", "#3b528b", "#21918c", "#5ec962", "#fde725"];
