import { useEffect, useRef, useState } from "react";
import { BRAND_LOGO_SRC, BRAND_NAME } from "@/shared/brand/identity";
import {
  hasBackendBeenReachable,
  subscribeToBackendReachable,
} from "@/shared/api/backendReachability";
import { pingBackendHealth } from "@/shared/api/health";
import { getBackendWarmupContent, type WarmupState } from "./backendWarmupContent";
import {
  hasStorefrontWarmupReady,
  subscribeToStorefrontWarmupReady,
} from "./storefrontWarmupReady";

const WARMUP_ENABLED = import.meta.env.VITE_ENABLE_BACKEND_WARMUP_OVERLAY === "true";
const OVERLAY_REVEAL_DELAY_MS = 2200;
const RETRY_DELAY_MS = 2500;
const REQUEST_TIMEOUT_MS = 8000;
const FAILSAFE_DISMISS_DELAY_MS = 15000;
const POST_READY_HOLD_MS = 400;
const OVERLAY_EXIT_DURATION_MS = 260;

// Covers the initial Render cold start with a branded storefront-level overlay.
export function BackendWarmupOverlay() {
  const backendReadyAtStart = hasBackendBeenReachable();
  const storefrontReadyAtStart = hasStorefrontWarmupReady();
  // Start hidden when the backend answered recently in this browser. That keeps
  // refreshes and new tabs from flashing the warmup UI after the API is already up.
  const [ready, setReady] = useState(
    !WARMUP_ENABLED || (backendReadyAtStart && storefrontReadyAtStart)
  );
  const [visible, setVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [state, setState] = useState<WarmupState>("checking");
  const visibleRef = useRef(visible);
  const backendReadyRef = useRef(backendReadyAtStart);
  const storefrontReadyRef = useRef(storefrontReadyAtStart);

  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  useEffect(() => {
    if (!WARMUP_ENABLED || ready) {
      return;
    }

    let isMounted = true;
    let retryTimeoutId: number | undefined;
    let dismissTimeoutId: number | undefined;
    let activeController: AbortController | null = null;

    const completeWarmupIfReady = () => {
      if (!backendReadyRef.current || !storefrontReadyRef.current) {
        return;
      }

      dismissOverlay();
    };

    // Delay the reveal so fast backend responses never flash the overlay.
    const revealTimeoutId = window.setTimeout(() => {
      if (isMounted && !ready) {
        setIsClosing(false);
        setVisible(true);
      }
    }, OVERLAY_REVEAL_DELAY_MS);

    // Always leave the user an exit path even if a browser extension, privacy
    // mode, or network edge case blocks the normal health-check flow.
    const failsafeTimeoutId = window.setTimeout(() => {
      if (!isMounted) {
        return;
      }

      dismissOverlay();
    }, FAILSAFE_DISMISS_DELAY_MS);

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

      // If the backend becomes reachable before the overlay is shown, skip the
      // exit animation and complete immediately.
      if (!visibleRef.current) {
        setReady(true);
        setVisible(false);
        return;
      }

      dismissTimeoutId = window.setTimeout(() => {
        if (!isMounted) {
          return;
        }

        setIsClosing(true);
        dismissTimeoutId = window.setTimeout(() => {
          if (!isMounted) {
            return;
          }

          setVisible(false);
          setReady(true);
          setIsClosing(false);
        }, OVERLAY_EXIT_DURATION_MS);
      }, POST_READY_HOLD_MS);
    };

    const unsubscribeFromReachability = subscribeToBackendReachable(() => {
      backendReadyRef.current = true;
      completeWarmupIfReady();
    });

    const unsubscribeFromStorefrontReady = subscribeToStorefrontWarmupReady(() => {
      storefrontReadyRef.current = true;
      completeWarmupIfReady();
    });

    async function checkBackendHealth() {
      // Keep only one in-flight health probe so retries cannot stack up under
      // slow networks or when the tab wakes from the background.
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
          backendReadyRef.current = true;
          completeWarmupIfReady();
          return;
        }
      } catch {
        window.clearTimeout(timeoutId);
      }

      if (!isMounted) {
        return;
      }

      if (visibleRef.current) {
        setState("waking");
      }
      // Retry with a fixed cadence so the perceived wait stays predictable and
      // the overlay copy can remain honest about what the app is doing.
      retryTimeoutId = window.setTimeout(() => {
        void checkBackendHealth();
      }, RETRY_DELAY_MS);
    }

    void checkBackendHealth();

    return () => {
      isMounted = false;
      activeController?.abort();
      unsubscribeFromReachability();
      unsubscribeFromStorefrontReady();

      if (retryTimeoutId) {
        window.clearTimeout(retryTimeoutId);
      }

      if (revealTimeoutId) {
        window.clearTimeout(revealTimeoutId);
      }

      if (failsafeTimeoutId) {
        window.clearTimeout(failsafeTimeoutId);
      }

      if (dismissTimeoutId) {
        window.clearTimeout(dismissTimeoutId);
      }
    };
  }, [ready]);

  if (ready || !visible) {
    return null;
  }

  const content = getBackendWarmupContent(state);

  return (
    <div
      aria-live="polite"
      aria-busy="true"
      className={`backend-warmup-overlay${isClosing ? " is-closing" : ""}`}
      role="status"
    >
      <div className="backend-warmup-panel">
        <div className="backend-warmup-emblem" aria-hidden="true">
          <div className="backend-warmup-ring backend-warmup-ring--outer" />
          <div className="backend-warmup-ring backend-warmup-ring--inner" />
          <img src={BRAND_LOGO_SRC} alt="loading_screen_logo" className="backend-warmup-logo" />
        </div>

        <p className="backend-warmup-brand">{BRAND_NAME}</p>
        <p className="backend-warmup-phase">{content.phaseLabel}</p>
        <h2 className="backend-warmup-title">{content.title}</h2>
        <p className="backend-warmup-status">{content.statusMessage}</p>
        <p className="backend-warmup-detail">{content.detailMessage}</p>
      </div>
    </div>
  );
}

export default BackendWarmupOverlay;
