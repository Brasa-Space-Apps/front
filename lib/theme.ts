export interface ThemeColors {
  surface: string;
  surface2: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
}

const fallback: ThemeColors = {
  surface: "#FFFFFF",
  surface2: "#EEE9E1",
  border: "#D1C9BE",
  text: "#241F1A",
  muted: "#5F574E",
  accent: "#B8431A",
};

export function readThemeColors(): ThemeColors {
  if (typeof document === "undefined") return fallback;
  const styles = getComputedStyle(document.documentElement);
  const read = (name: string, value: string) => styles.getPropertyValue(name).trim() || value;
  return {
    surface: read("--surface", fallback.surface),
    surface2: read("--surface-2", fallback.surface2),
    border: read("--border", fallback.border),
    text: read("--text", fallback.text),
    muted: read("--text-muted", fallback.muted),
    accent: read("--accent", fallback.accent),
  };
}

export function subscribeToTheme(onChange: () => void) {
  window.addEventListener("brasa-theme", onChange);
  return () => window.removeEventListener("brasa-theme", onChange);
}
