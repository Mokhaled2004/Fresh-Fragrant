# Adding a language

Localization is optional. Keep `enabled` false in `src/config/locales.json` to leave the storefront in English and hide the language selector.

To add a locale:

1. Copy `en.json` to a new file named for its language code (for example `fr.json`) and translate the values while keeping the keys unchanged.
2. Import that JSON in `src/lib/locale.ts` and add it to `localeMessages`.
3. Add the code to `locales` in `src/config/locales.json`, then set `enabled` to true.
4. Use `useLocale().t("common.search")` in client components for translated text. Add matching keys to every locale file. Arabic (`ar`) automatically sets the document direction to RTL; other locales use LTR.

The English and Arabic files provide starter keys. Existing page copy stays as written until it is switched to `t()`.
