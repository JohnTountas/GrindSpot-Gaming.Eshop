/**
 * Shared application shell.
 *
 * This is the one place where global UI concerns meet: header state, footer
 * messaging, toast host, guest-cart sync, and the route outlet.
 */
import { useQueryClient } from "@tanstack/react-query";
import { Outlet, useNavigate } from "react-router-dom";
import { logout } from "@/features/auth/api/auth";
import { clearSession, useAuthSession } from "@/shared/auth/session";
import { useCartData } from "@/features/cart/hooks/useCartData";
import { useBackendReachabilityRecovery } from "@/shared/api/useBackendReachabilityRecovery";
import ToastHost from "@/shared/components/feedback/ToastHost";
import { useWishlist } from "@/shared/shopping";
import { showSuccessMessage } from "@/shared/ui/toast";
import BackendWarmupOverlay from "@/shared/components/feedback/BackendWarmupOverlay";
import LayoutFooter from "./components/LayoutFooter";
import LayoutHeader from "./components/LayoutHeader";
import FooterMessageModal from "./components/FooterMessageModal";
import { useFooterMessageDialog } from "./hooks/useFooterMessageDialog";
import { useHeaderVisibility } from "./hooks/useHeaderVisibility";
import { useGuestCartSync } from "@/shared/cart/auth/hooks/useGuestCartSync";

function Layout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { authed, user } = useAuthSession();
  const { cart } = useCartData();
  const currentYear = new Date().getFullYear();
  const wishlist = useWishlist();
  const cartCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const cartCountLabel = cartCount > 99 ? "99+" : `${cartCount}`;
  const wishlistCountLabel = wishlist.ids.length > 99 ? "99+" : `${wishlist.ids.length}`;
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
  const isHeaderVisible = useHeaderVisibility();
  const { activeMessage, openFooterMessage, closeFooterMessage } = useFooterMessageDialog();

  // Run this once at the shell level so every authenticated route benefits from
  // the same guest-to-account cart handoff.
  useGuestCartSync(authed, queryClient);
  useBackendReachabilityRecovery(queryClient);

  // `instant` is not part of the standard ScrollBehavior union and browsers can
  // disagree on how to handle it. `auto` gives us the immediate jump we want
  // while staying within the cross-browser API contract.
  function scrollToPageStart() {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }

  // Logout immediately drops client session state, then clears the refresh cookie
  // in the background so stale requests cannot restore the previous session.
  function handleLogout() {
    const logoutUsername =
      displayName || user?.email?.split("@")[0]?.trim() || user?.email || "User";

    showSuccessMessage({
      title: "Logout successful",
      message: `See you soon: ${logoutUsername}`,
      tone: "success",
    });

    clearSession();
    queryClient.clear();
    navigate("/login", { replace: true });
    void logout().catch(() => undefined);
  }

  return (
    <div className="relative isolate min-h-screen overflow-x-clip bg-grain-gradient">
      <BackendWarmupOverlay />
      <ToastHost />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-primary-100 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-900"
      >
        Skip to main content
      </a>

      {/* Decorative background layers live here so feature pages do not need to
          know anything about the global visual treatment. */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 -top-36 h-96 w-96 animate-float-slow rounded-full bg-primary-800/32 blur-3xl" />
        <div className="absolute right-[-6rem] top-28 h-[26rem] w-[26rem] animate-float-slow rounded-full bg-accent-800/20 blur-3xl [animation-delay:1.6s]" />
        <div className="absolute bottom-[-10rem] left-1/3 h-80 w-80 animate-float-slow rounded-full bg-accent-700/16 blur-3xl [animation-delay:2.1s]" />
      </div>

      <LayoutHeader
        authed={authed}
        user={user}
        displayName={displayName}
        cartCountLabel={cartCountLabel}
        isHeaderVisible={isHeaderVisible}
        wishlistCountLabel={wishlistCountLabel}
        onLogout={handleLogout}
        onScrollToTop={scrollToPageStart}
      />

      <main id="main-content" className="container py-6 sm:py-8 md:py-10">
        <Outlet />
      </main>

      <LayoutFooter currentYear={currentYear} onOpenFooterMessage={openFooterMessage} />
      <FooterMessageModal message={activeMessage} onClose={closeFooterMessage} />
    </div>
  );
}

export default Layout;
