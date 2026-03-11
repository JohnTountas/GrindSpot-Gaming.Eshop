/**
 * Global toast host rendered once in the layout shell for user feedback pop-ups.
 */
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { subscribeToToasts, ToastPayload } from '@/lib/ui/toast';

// Fallback auto-dismiss duration for toasts without explicit timing.
const DEFAULT_DURATION_MS = 2600;

// Renders and auto-dismisses global toast notifications dispatched through window events.
function ToastHost() {
  const [activeToast, setActiveToast] = useState<ToastPayload | null>(null);
  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = subscribeToToasts((toast) => {
      window.clearTimeout(timeoutRef.current);
      setActiveToast(toast);

      timeoutRef.current = window.setTimeout(() => {
        setActiveToast(null);
      }, toast.durationMs ?? DEFAULT_DURATION_MS);
    });

    return () => {
      unsubscribe();
      window.clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!activeToast) {
    return null;
  }

  const toneClass =
    activeToast.tone === 'success'
      ? 'border-emerald-300/80 bg-emerald-50/95 text-emerald-900'
      : 'border-red-300/80 bg-red-50/95 text-red-900';
  const placementClass =
    activeToast.placement === 'center'
      ? 'fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[10px]'
      : 'fixed right-4 top-[10px] z-[70] w-[min(92vw,380px)] sm:right-6';
  const toastWidthClass = activeToast.placement === 'center' ? 'w-[min(92vw,540px)]' : '';

  return (
    <div className={`pointer-events-none ${placementClass}`}>
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-auto animate-scale-in rounded-2xl border px-4 py-3 shadow-raised backdrop-blur-md ${toneClass} ${toastWidthClass}`}
      >
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className={`mt-1 inline-block h-2.5 w-2.5 rounded-full ${
              activeToast.tone === 'success' ? 'bg-emerald-600' : 'bg-red-600'
            }`}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold tracking-wide">{activeToast.title}</p>
            {activeToast.message && (
              <p className="mt-0.5 text-sm font-medium">{activeToast.message}</p>
            )}
            {activeToast.actionLabel && activeToast.actionTo && (
              <Link
                to={activeToast.actionTo}
                className="mt-2 inline-flex text-xs font-semibold uppercase tracking-[0.13em] underline decoration-2 underline-offset-4"
                onClick={() => setActiveToast(null)}
              >
                {activeToast.actionLabel}
              </Link>
            )}
          </div>
          <button
            type="button"
            onClick={() => setActiveToast(null)}
            className="rounded-md px-1.5 py-1 text-xs font-semibold uppercase tracking-[0.11em] opacity-70 hover:opacity-100"
            aria-label="Dismiss notification"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ToastHost;
