import configuration from "@/config/locales.json";
import english from "@/locales/en.json";
import arabic from "@/locales/ar.json";

export const localeConfig = configuration;
export const localeMessages = { en: english, ar: arabic } as const;
export type Locale = keyof typeof localeMessages;

export function isLocale(value: string | undefined): value is Locale {
  return Boolean(value && (configuration.locales as readonly string[]).includes(value));
}
