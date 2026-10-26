"use client";

import { localeConfig } from "@/lib/locale";
import { useLocale } from "@/components/layout/LocaleProvider";

export default function LocaleSwitcher() {
  const { locale, setLocale } = useLocale();
  if (!localeConfig.enabled) return null;

  return (
    <select
      aria-label="Language"
      value={locale}
      onChange={(event) => setLocale(event.target.value as typeof locale)}
      className="rounded-md border border-gray-200 bg-[var(--theme-bgElevated)] px-2 py-1 text-xs text-foreground"
    >
      {localeConfig.locales.map((code) => (
        <option key={code} value={code}>{code.toUpperCase()}</option>
      ))}
    </select>
  );
}
