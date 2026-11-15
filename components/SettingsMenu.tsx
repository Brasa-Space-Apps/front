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

          <label className="mt-4 block text-sm font-semibold" htmlFor="vision-select">{t.colorVision}</label>
          <select
            id="vision-select"
            value={vision}
            onChange={(event) => updateVision(event.target.value as ColorVision)}
            className="mt-1 w-full rounded-md border border-foreground/30 bg-background px-2 py-2 text-sm"
          >
            <option value="normal">{t.normalVision}</option>
            <option value="tritanopia">{t.tritanopia}</option>
            <option value="protanopia">{t.protanopia}</option>
            <option value="deuteranopia">{t.deuteranopia}</option>
          </select>
        </div>
      )}
    </div>
  );
}
