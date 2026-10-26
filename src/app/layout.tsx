import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import { cookies } from "next/headers";
import LocaleProvider from "@/components/layout/LocaleProvider";
import { isLocale, localeConfig } from "@/lib/locale";
import type { Locale } from "@/lib/locale";
import { themeCss } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Beautya | Skincare & Cosmetics",
  description: "Unlock your natural glow with Beautya's premium skincare and cosmetics collection.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const cookieStore = await cookies();
  const cookieLocale = localeConfig.enabled ? cookieStore.get("site_locale")?.value : undefined;
  const locale: Locale = isLocale(cookieLocale) ? cookieLocale : localeConfig.defaultLocale as Locale;
  const direction = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={direction} className={`${geistSans.variable} ${inter.variable} h-full antialiased`}>
      <head><style>{themeCss}</style></head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <LocaleProvider initialLocale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
