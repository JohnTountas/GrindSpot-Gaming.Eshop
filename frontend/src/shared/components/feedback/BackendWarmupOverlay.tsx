import { useEffect, useState } from "react";
import { BRAND_LOGO_SRC, BRAND_NAME, BRAND_TAGLINE } from "@/shared/brand/identity";
import {
  hasBackendBeenReachable,
  subscribeToBackendReachable,
} from "@/shared/api/backendReachability";
import { pingBackendHealth } from "@/shared/api/health";

const WARMUP_ENABLED = import.meta.env.VITE_ENABLE_BACKEND_WARMUP_OVERLAY === "true";
const OVERLAY_REVEAL_DELAY_MS = 2200;
const RETRY_DELAY_MS = 2500;
const REQUEST_TIMEOUT_MS = 8000;
const FAILSAFE_DISMISS_DELAY_MS = 15000;

type WarmupState = "checking" | "waking";

// Covers the initial Render cold start with a branded storefront-level overlay.
export function BackendWarmupOverlay() {
  const [ready, setReady] = useState(!WARMUP_ENABLED || hasBackendBeenReachable());
  const [visible, setVisible] = useState(false);
  const [state, setState] = useState<WarmupState>("checking");

  useEffect(() => {
    if (!WARMUP_ENABLED || ready) {
      return;
    }

    let isMounted = true;
    let retryTimeoutId: number | undefined;
    let revealTimeoutId: number | undefined;
    let failsafeTimeoutId: number | undefined;
    let activeController: AbortController | null = null;

    const dismissOverlay = () => {
      if (!isMounted) {
        return;
      }

      if (retryTimeoutId) {
        window.clearTimeout(retryTimeoutId);
      }

      if (revealTimeoutId) {
        window.clearTimeout(revealTimeoutId);
      }

      if (failsafeTimeoutId) {
        window.clearTimeout(failsafeTimeoutId);
      }

      activeController?.abort();
      setReady(true);
      setVisible(false);
    };

    const unsubscribeFromReachability = subscribeToBackendReachable(dismissOverlay);

    revealTimeoutId = window.setTimeout(() => {
      if (isMounted && !ready) {
        setVisible(true);
      }
    }, OVERLAY_REVEAL_DELAY_MS);

    // A readiness overlay should never become a permanent blocker. If a browser
    // rejects or delays the cross-origin health probe differently, we prefer to
    // fall back to the page's normal loading states instead of trapping the user.
    failsafeTimeoutId = window.setTimeout(() => {
      if (!isMounted) {
        return;
      }

      dismissOverlay();
    }, FAILSAFE_DISMISS_DELAY_MS);

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
          dismissOverlay();
          return;
        }
      } catch {
        window.clearTimeout(timeoutId);
      }

      if (!isMounted) {
        return;
      }

      setState("waking");
      retryTimeoutId = window.setTimeout(() => {
        void checkBackendHealth();
      }, RETRY_DELAY_MS);
    }

    void checkBackendHealth();

    return () => {
      isMounted = false;
      activeController?.abort();
      unsubscribeFromReachability();

      if (retryTimeoutId) {
        window.clearTimeout(retryTimeoutId);
      }

      if (revealTimeoutId) {
        window.clearTimeout(revealTimeoutId);
      }

      if (failsafeTimeoutId) {
        window.clearTimeout(failsafeTimeoutId);
      }
    };
  }, [ready]);

  if (ready || !visible) {
    return null;
  }

  const statusMessage =
    state === "checking"
      ? "Syncing the storefront and checking service readiness."
      : "Please wait while the backend wakes up...";

  return (
    <div aria-live="polite" aria-busy="true" className="backend-warmup-overlay" role="status">
      <div className="backend-warmup-panel">
        <div className="backend-warmup-emblem" aria-hidden="true">
          <div className="backend-warmup-ring backend-warmup-ring--outer" />
          <div className="backend-warmup-ring backend-warmup-ring--inner" />
          <img src={BRAND_LOGO_SRC} alt="loading_screen_logo" className="backend-warmup-logo" />
        </div>

        <p className="backend-warmup-brand">{BRAND_NAME}</p>
        <h2 className="backend-warmup-title text-balance">Loading the arena</h2>
        <p className="backend-warmup-status">{statusMessage}</p>
        <div className="backend-warmup-progress" aria-hidden="true">
          <span />
        </div>
        <p className="backend-warmup-tagline">{BRAND_TAGLINE}</p>

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
