import theme from "@/config/themes/shop-violet.json";

export type ThemePalette = typeof theme.light;
export const activeTheme = theme;

type ThemeExtensions = {
  typography?: {
    fontSans?: string;
    fontShopifySans?: string;
    fontMono?: string;
    bodySize?: string;
    bodyLineHeight?: string;
    bodyTracking?: string;
    headingTracking?: string;
  };
  fontWeights?: Partial<Record<"regular" | "medium" | "semibold" | "bold", string>>;
  radii?: Partial<Record<"sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full", string>>;
};
const config = theme as typeof theme & ThemeExtensions;

const cssProperties = (palette: ThemePalette) =>
  Object.entries(palette)
    .filter(([, value]) => typeof value === "string")
    .map(([key, value]) => `--theme-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}:${value}`)
    .join(";");

const basePalette = theme.mode === "dark" ? theme.dark : theme.light;
const colorScheme = theme.mode === "both" ? "light dark" : theme.mode;
const typography = config.typography ?? {};
const fontWeights = config.fontWeights ?? {};
const radii = config.radii ?? {};
const designProperties = [
  ["font-sans", typography.fontSans ?? "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif"],
  ["font-shopify-sans", typography.fontShopifySans ?? "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif"],
  ["font-mono", typography.fontMono ?? "ui-monospace, monospace"],
  ["body-size", typography.bodySize ?? "16px"],
  ["body-line-height", typography.bodyLineHeight ?? "1.33"],
  ["body-tracking", typography.bodyTracking ?? "normal"],
  ["heading-tracking", typography.headingTracking ?? "-0.05em"],
  ["weight-regular", fontWeights.regular ?? "400"],
  ["weight-medium", fontWeights.medium ?? "500"],
  ["weight-semibold", fontWeights.semibold ?? "600"],
  ["weight-bold", fontWeights.bold ?? "600"],
  ["radius-sm", radii.sm ?? "8px"],
  ["radius-md", radii.md ?? "12px"],
  ["radius-lg", radii.lg ?? "16px"],
  ["radius-xl", radii.xl ?? "20px"],
  ["radius-2xl", radii["2xl"] ?? basePalette.radius],
  ["radius-3xl", radii["3xl"] ?? basePalette.radius],
  ["radius-full", radii.full ?? "9999px"],
].map(([key, value]) => `--theme-${key}:${value}`).join(";");

export const themeCss = `:root{color-scheme:${colorScheme};${cssProperties(basePalette)};${designProperties}}${
  theme.mode === "both" ? `@media(prefers-color-scheme:dark){:root{${cssProperties(theme.dark)}}}` : ""
}`;
