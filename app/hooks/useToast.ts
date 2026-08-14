import { useState, useRef, useCallback } from 'react';

export interface ToastType {
  message: string;
  type: 'success' | 'error' | 'info';
}

/**
 * Single Responsibility: Manages toast message state, type, and auto-dismiss timer lifecycle.
 */
export function useToast(autoDismissMs: number = 4000) {
  const [toast, setToast] = useState<ToastType | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  const triggerToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      if (!message) return;

      setToast({ message, type });

      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }

      toastTimeoutRef.current = setTimeout(() => {
        setToast(null);
      }, autoDismissMs);
    },
    [autoDismissMs]
  );

  const dismissToast = useCallback(() => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast(null);
  }, []);

  return {
    toast,
    setToast,
    triggerToast,
    dismissToast,
  };
}
