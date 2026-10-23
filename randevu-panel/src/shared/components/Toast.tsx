// App-wide transient notification: lets a modal confirm an action and close itself, while the
// message stays visible after the modal unmounts.
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { Banner } from "./Banner";
import type { BannerVariant } from "./Banner";
import { ToastContext } from "./toastContext";
import type { ShowToast } from "./toastContext";

interface ToastState {
  id: number;
  message: string;
  variant: BannerVariant;
}

const TOAST_DURATION_MS = 2500;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const nextId = useRef(0);

  const showToast = useCallback<ShowToast>((message, variant = "success") => {
    nextId.current += 1;
    setToast({ id: nextId.current, message, variant });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), TOAST_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast &&
        createPortal(
          <div className="fixed inset-x-0 top-4 z-[100] flex justify-center px-4 pointer-events-none" role="status" aria-live="polite">
            <Banner key={toast.id} variant={toast.variant} className="shadow-lg text-sm pointer-events-auto">
              {toast.message}
            </Banner>
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}
