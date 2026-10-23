import { useCallback } from "react";
import { useT } from "../i18n/i18nContext";
import { resolveError } from "./resolveError";

/**
 * i18n destekli hata çözümleme hook'u.
 *
 * Kullanım:
 *   const resolve = useResolveError();
 *   } catch (err) {
 *     setError(resolve(err));
 *   }
 */
export function useResolveError() {
  const { t } = useT();
  return useCallback(
    (error: unknown, fallback?: string) => resolveError(error, t, fallback),
    [t],
  );
}
