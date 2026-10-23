// Toast context and hook live apart from the provider component so that Toast.tsx exports
// only components (required by React Fast Refresh, see eslint react-refresh/only-export-components).
import { createContext, useContext } from "react";
import type { BannerVariant } from "./Banner";

export type ShowToast = (message: string, variant?: BannerVariant) => void;

export const ToastContext = createContext<ShowToast | null>(null);

export function useToast(): ShowToast {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
