"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import { getCopy } from "@/lib/i18n";
import type { ColorVision, Locale, Theme } from "@/lib/types";

const languagePaths: Record<Locale, string> = {
  en: "/",
  "pt-BR": "/pt-br",
  es: "/es",
};

function subscribe(key: string, onChange: () => void) {
  const handler = (event: Event) => {
    if (event.type === key || event.type === "storage") onChange();
  };
  window.addEventListener(key, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(key, handler);
    window.removeEventListener("storage", handler);
  };
}

function readTheme(): Theme {
  return localStorage.getItem("brasa-theme") === "dark" ? "dark" : "light";
}

function readVision(): ColorVision {
  const value = localStorage.getItem("brasa-color-vision");
  return value === "tritanopia" || value === "protanopia" || value === "deuteranopia" ? value : "normal";
}

export default function SettingsMenu({ locale }: { locale: Locale }) {
  const t = getCopy(locale);
  const [open, setOpen] = useState(false);
  const theme = useSyncExternalStore(
    (onChange) => subscribe("brasa-theme", onChange),
    () => readTheme(),
    () => "light",
  );
  const vision = useSyncExternalStore(
    (onChange) => subscribe("brasa-color-vision", onChange),
    () => readVision(),
    () => "normal",
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("data-color-vision", vision);
  }, [theme, vision]);

  function updateTheme(next: Theme) {
    localStorage.setItem("brasa-theme", next);
    document.documentElement.setAttribute("data-theme", next);
    window.dispatchEvent(new Event("brasa-theme"));
  }

  function updateVision(next: ColorVision) {
    localStorage.setItem("brasa-color-vision", next);
    document.documentElement.setAttribute("data-color-vision", next);
    window.dispatchEvent(new Event("brasa-color-vision"));
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={t.settings}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="rounded-md border border-foreground/30 bg-background px-3 py-2 text-sm font-medium hover:bg-foreground/10 focus:outline-2 focus:outline-orange"
      >
        <span aria-hidden="true">⚙</span> {t.settings}
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-72 rounded-lg border border-foreground/20 bg-background p-4 shadow-lg">
          <label className="block text-sm font-semibold" htmlFor="language-select">{t.language}</label>
          <select
            id="language-select"
            value={locale}
            onChange={(event) => { window.location.href = languagePaths[event.target.value as Locale]; }}
            className="mt-1 w-full rounded-md border border-foreground/30 bg-background px-2 py-2 text-sm"
          >
            <option value="en">English</option>
            <option value="pt-BR">Português</option>
            <option value="es">Español</option>
          </select>

          <fieldset className="mt-4">
            <legend className="text-sm font-semibold">{t.theme}</legend>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {(["light", "dark"] as const).map((value) => (
                <label key={value} className="flex items-center gap-2 rounded-md border border-foreground/20 px-2 py-2 text-sm">
                  <input type="radio" name="theme" checked={theme === value} onChange={() => updateTheme(value)} />
                  {value === "light" ? t.light : t.dark}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-4">
            <legend className="text-sm font-semibold">{t.colorVision}</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {([
                ["normal", t.normalVision, "N"],
                ["tritanopia", t.tritanopia, "T"],
                ["protanopia", t.protanopia, "P"],
                ["deuteranopia", t.deuteranopia, "D"],
              ] as const).map(([value, label, mark]) => (
                <label
                  key={value}
                  className={`flex min-w-0 cursor-pointer items-center gap-1.5 rounded-md border px-2 py-2 text-xs transition focus-within:outline-2 focus-within:outline-orange focus-within:outline-offset-1 ${
                    vision === value
                      ? "border-orange bg-orange/10 font-semibold"
                      : "border-foreground/20 hover:border-foreground/50 hover:bg-foreground/5"
                  }`}
                >
                  <input
                    type="radio"
                    name="color-vision"
                    value={value}
                    checked={vision === value}
                    onChange={() => updateVision(value)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[0.7rem] font-semibold ${
                      vision === value ? "bg-orange text-white" : "bg-foreground/10 text-foreground"
                    }`}
                  >
                    {mark}
                  </span>
                  <span className="min-w-0 truncate">{label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      )}
    </div>
  );
}
