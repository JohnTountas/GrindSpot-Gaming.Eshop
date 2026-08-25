import { useEffect, useState } from 'react';
import { BRAND_LOGO_SRC, BRAND_NAME, BRAND_TAGLINE } from '@/shared/brand/identity';
import { pingBackendHealth } from '@/shared/api/health';

const WARMUP_ENABLED = import.meta.env.VITE_ENABLE_BACKEND_WARMUP_OVERLAY === 'true';
const OVERLAY_REVEAL_DELAY_MS = 1200;
const RETRY_DELAY_MS = 2500;
const REQUEST_TIMEOUT_MS = 8000;

type WarmupState = 'checking' | 'waking';

// Covers the initial Render cold start with a branded storefront-level overlay.
export function BackendWarmupOverlay() {
  const [ready, setReady] = useState(!WARMUP_ENABLED);
  const [visible, setVisible] = useState(false);
  const [state, setState] = useState<WarmupState>('checking');

  useEffect(() => {
    if (!WARMUP_ENABLED) {
      return;
    }

    let isMounted = true;
    let retryTimeoutId: number | undefined;
    let revealTimeoutId: number | undefined;
    let activeController: AbortController | null = null;

    revealTimeoutId = window.setTimeout(() => {
      if (isMounted && !ready) {
        setVisible(true);
      }
    }, OVERLAY_REVEAL_DELAY_MS);

    async function checkBackendHealth() {
      activeController?.abort();
      activeController = new AbortController();

      const timeoutId = window.setTimeout(() => {
        activeController?.abort();
      }, REQUEST_TIMEOUT_MS);

      try {
        const isHealthy = await pingBackendHealth(activeController.signal);
        window.clearTimeout(timeoutId);

        if (!isMounted) {
          return;
        }

        if (isHealthy) {
          setReady(true);
          setVisible(false);
          return;
        }
      } catch {
        window.clearTimeout(timeoutId);
      }

      if (!isMounted) {
        return;
      }

      setState('waking');
      retryTimeoutId = window.setTimeout(() => {
        void checkBackendHealth();
      }, RETRY_DELAY_MS);
    }

    void checkBackendHealth();

    return () => {
      isMounted = false;
      activeController?.abort();

      if (retryTimeoutId) {
        window.clearTimeout(retryTimeoutId);
      }

      if (revealTimeoutId) {
        window.clearTimeout(revealTimeoutId);
      }
    };
  }, [ready]);

  if (ready || !visible) {
    return null;
  }

  const statusMessage =
    state === 'checking'
      ? 'Syncing the storefront and checking service readiness.'
      : 'Loading... This may take a few seconds while the backend wakes up.';

  return (
    <div
      aria-live="polite"
      aria-busy="true"
      className="backend-warmup-overlay"
      role="status"
    >
      <div className="backend-warmup-panel">
        <div className="backend-warmup-emblem" aria-hidden="true">
          <div className="backend-warmup-ring backend-warmup-ring--outer" />
          <div className="backend-warmup-ring backend-warmup-ring--inner" />
          <img
            src={BRAND_LOGO_SRC}
            alt=""
            className="relative z-10 h-16 w-16 object-contain drop-shadow-[0_0_24px_rgba(29,242,255,0.28)]"
          />
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.36em] text-cyan-200/70">
          {BRAND_NAME}
        </p>
        <h2 className="text-balance text-3xl font-semibold text-white sm:text-4xl">
          Loading the arena
        </h2>
        <p className="max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
          {statusMessage}
        </p>
        <p className="text-xs uppercase tracking-[0.28em] text-cyan-100/55">{BRAND_TAGLINE}</p>

        <div className="backend-warmup-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

export default BackendWarmupOverlay;
