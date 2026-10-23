// The context object and useT() hook live in ./i18nContext.
import { useState, type ReactNode } from "react";
import { tr, type Translations } from "./locales/tr";
import { en } from "./locales/en";
import { I18nContext, type Locale } from "./i18nContext";

export type { Locale } from "./i18nContext";

const LOCALES: Record<Locale, Translations> = { tr, en };
const STORAGE_KEY = "randevu_locale";

function getInitialLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "en" ? "en" : "tr";
}

// ─── Provider ────────────────────────────────────────────────────────────────
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = (l: Locale) => {
    localStorage.setItem(STORAGE_KEY, l);
    setLocaleState(l);
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, translations: LOCALES[locale] }}>
      {children}
    </I18nContext.Provider>
  );
}
