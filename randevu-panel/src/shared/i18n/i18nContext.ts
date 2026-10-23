// i18n context and useT() hook live apart from I18nProvider so that I18nProvider.tsx exports
// only components (required by React Fast Refresh, see eslint react-refresh/only-export-components).
import { createContext, useCallback, useContext } from "react";
import type { Translations } from "./locales/tr";

export type Locale = "tr" | "en";

// ─── Interpolation helper ────────────────────────────────────────────────────
function interpolate(str: string, vars?: Record<string, string | number>): string {
  if (!vars) return str;
  return Object.entries(vars).reduce(
    (acc, [key, val]) => acc.replace(`{{${key}}}`, String(val)),
    str,
  );
}

// ─── Context ─────────────────────────────────────────────────────────────────
export interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  translations: Translations;
}

export const I18nContext = createContext<I18nContextValue | null>(null);

// ─── Hook ────────────────────────────────────────────────────────────────────
type Selector<T> = (t: Translations) => T;

export function useT() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useT must be used inside I18nProvider");

  const { locale, setLocale, translations } = ctx;

  /** Type-safe translation lookup with optional {{variable}} interpolation */
  const t = useCallback(
    <T,>(selector: Selector<T>, vars?: Record<string, string | number>): T => {
      const value = selector(translations);
      if (typeof value === "string" && vars) {
        return interpolate(value, vars) as T;
      }
      return value;
    },
    [translations],
  );

  return { t, locale, setLocale };
}
