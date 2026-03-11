/**
 * Shared application shell (header, navigation, and premium conversion footer).
 */
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { guestCartHasItems, syncGuestCartToServer } from "@/lib/cart/guestCart";
import { clearSession, getStoredUser, isAuthenticated } from "@/lib/auth/session";
import { useWishlist } from "@/lib/gaming/storefront";
import ToastHost from "@/components/feedback/ToastHost";
import { BRAND_LOGO_SRC, BRAND_NAME, BRAND_POSITIONING, BRAND_TAGLINE } from "@/lib/brand/identity";
import { showSuccessMessage } from "@/lib/ui/toast";

// Custom event name used to open footer policy/support modals.
const FOOTER_MESSAGE_EVENT = "grindspot:open-footer-message";

// Centralized navigation style builder keeps active/inactive link behavior consistent.
// Generates navigation link styles based on active route state.
const linkClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold tracking-[0.08em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-700 ${
    isActive
      ? "bg-primary-800 text-white shadow-neon"
      : "border border-primary-300/60 bg-primary-100/60 text-primary-700 hover:-translate-y-0.5 hover:border-accent-700/60 hover:text-primary-900"
  }`;

// Footer knowledge-base content keyed by event names used across the app.
// Footer modal content keyed by support/policy identifiers.
const FOOTER_MESSAGES = {
  helpCenter: {
    section: "Support",
    title: "Help Center",
    body: "1. Standard Products: Gaming peripherals and accessories may be returned within 7 days of delivery provided the item is unused, original packaging is intact, and proof of purchase is provided. Refunds will be issued to the original payment method unless otherwise agreed. 2. Custom-Built PCs: Custom-built or specially configured desktop systems may not be eligible for return unless defective or damaged upon delivery. 3. Defective Products: If a product is defective, customers must notify GrindSpot within 7 days of delivery. Warranty claims may be handled directly with the manufacturer where applicable.",
  },
  orderTracking: {
    section: "Support",
    title: "Order Tracking",
    body: "Order Tracking gives you full visibility from confirmation to final delivery through clearly defined status milestones. After dispatch, your order timeline includes carrier details, tracking identifiers, and live transit progress so you can monitor movement in real time. In cases of delay, rerouting, or delivery exceptions, status notes are updated promptly to keep you informed and to help you plan with confidence.",
  },
  contactSupport: {
    section: "Support",
    title: "Contact Support",
    body: "For inquiries regarding these Terms: • Email: giannis93.tds@gmail.com • Address: www.grindspot.com • Phone: +306977664135",
  },
  warrantyClaims: {
    section: "Support",
    title: "Warranty Claims",
    body: "Warranty Claims are handled through a structured process to ensure fair, timely, and transparent outcomes. Eligible requests may require proof of purchase, serial details, and a short description of the defect so our team can validate coverage and recommend the correct service path. Once approved, we coordinate next steps for repair, replacement, or equivalent resolution and keep you updated until the case is fully completed.",
  },
  shippingPolicy: {
    section: "Policies",
    title: "Shipping Policy",
    body: " Delivery timeframes are estimates and not guaranteed. GrindSpot is not responsible for delays caused by: • Shipping carriers, • Customs or import processes, • Incorrect shipping information, • Force majeure events. Risk of loss transfers to the customer upon confirmed delivery.",
  },
  returnsRefunds: {
    section: "Policies",
    title: "Returns & Refunds",
    body: "1. Standard Products: Gaming peripherals and accessories may be returned within 7 days of delivery provided: The item is unused Original packaging is intact Proof of purchase is provided Refunds will be issued to the original payment method unless otherwise agreed. 2. Custom-Built PCs: Custom-built or specially configured desktop systems may not be eligible for return unless defective or damaged upon delivery. 3. Defective Products: If a product is defective, customers must notify GrindSpot within 7 days of delivery. Warranty claims may be handled directly with the manufacturer where applicable.",
  },
  privacySecurity: {
    section: "Policies",
    title: "Privacy & Policy",
    body: " GrindSpot respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and purchase products from our platform. By using the Platform, you agree to the terms of this Privacy Policy. We may collect the following categories of information: 1. Personal Information: • Full name, • Billing and shipping address, • Email address, • Phone number, • Payment information (processed securely by third-party providers), • Account login credentials. 2 Order Information: • Products purchased • Order history • Transaction details • Customer service communications. 3 Technical and Usage Data: • IP address, • Browser type and version, • Device information, • Operating system, • Pages visited and browsing behavior, • Cookies and tracking technologies. 4. How We Use Your Information: We use collected information to: • Process and fulfill orders, • Provide customer support, • Manage user accounts, • Communicate order updates and service notices, • Improve website functionality and user experience, • Prevent fraud and unauthorized transactions, • Comply with legal obligations. We do NOT sell personal information to third parties. ",
  },
  termsOfService: {
    section: "Policies",
    title: "Terms of Service",
    body: " Welcome to GrindSpot Company. These Terms of Service govern your access to and use of the GrindSpot website, online store, and related services. By accessing or using the Platform and purchasing products from GrindSpot, you agree to be legally bound by these Terms. If you do not agree, you must not use our services. 1. Eligibility: You must be at least 18 years old or the age of majority in your jurisdiction to make purchases on the Platform. By placing an order, you represent and warrant that you meet this requirement. Your use of the Platform is also governed by our Privacy Policy, which describes how we collect, use, and protect personal information.",
  },
} as const;

// Union of allowed footer message keys.
type FooterMessageKey = keyof typeof FOOTER_MESSAGES;

// Validates that unknown event payloads map to a supported footer message key.
function isFooterMessageKey(value: unknown): value is FooterMessageKey {
  return typeof value === "string" && value in FOOTER_MESSAGES;
}

// Builds the shared shell (header, navigation, outlet, footer, and modal messaging).
function Layout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const authed = isAuthenticated();
  const user = getStoredUser();
  const currentYear = new Date().getFullYear();
  const wishlist = useWishlist();
  const wishlistCountLabel = wishlist.ids.length > 99 ? "99+" : `${wishlist.ids.length}`;
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
  const [activeFooterMessage, setActiveFooterMessage] = useState<FooterMessageKey | null>(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  // Normalizes navigation jumps by forcing the viewport back to the top of the page.
  function scrollToPageStart() {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }

  // Clears session state, shows feedback, and routes the user back to login.
  function handleLogout() {
    const logoutUsername =
      displayName || user?.email?.split("@")[0]?.trim() || user?.email || "User";

    showSuccessMessage({
      title: "Logout successful",
      message: `See you soon, ${logoutUsername}`,
      tone: "success",
    });

    clearSession();
    navigate("/login");
  }

  // Opens a specific footer policy/support modal by key.
  function openFooterMessage(key: FooterMessageKey) {
    setActiveFooterMessage(key);
  }

  // Closes the active footer policy/support modal.
  function closeFooterMessage() {
    setActiveFooterMessage(null);
  }

  useEffect(() => {
    // Listens for global footer-modal open events and applies the requested message.
    function handleOpenFooterMessage(event: Event) {
      const customEvent = event as CustomEvent<unknown>;
      if (isFooterMessageKey(customEvent.detail)) {
        setActiveFooterMessage(customEvent.detail);
      }
    }

    window.addEventListener(FOOTER_MESSAGE_EVENT, handleOpenFooterMessage);
    return () => {
      window.removeEventListener(FOOTER_MESSAGE_EVENT, handleOpenFooterMessage);
    };
  }, []);

  useEffect(() => {
    if (!authed || !guestCartHasItems()) {
      return;
    }

    let cancelled = false;

    // Moves any guest cart lines into the authenticated server cart after sign-in.
    void (async () => {
      const { syncedCount } = await syncGuestCartToServer();

      if (cancelled || syncedCount === 0) {
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ["cart"] });
      showSuccessMessage({
        title: "Cart synced",
        message: "Your guest cart is now available in your account.",
        tone: "success",
        durationMs: 3500,
        actionLabel: "View cart",
        actionTo: "/cart",
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [authed, queryClient]);

  useEffect(() => {
    if (!activeFooterMessage) {
      return;
    }

    // Lets users dismiss modal content quickly with the Escape key.
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeFooterMessage();
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [activeFooterMessage]);

  // Tracks scroll direction with a small threshold to avoid header flicker on minor movement.
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const minimumDelta = 7;
    let ticking = false;

    // Uses scroll direction and thresholding to hide/show the sticky header smoothly.
    function handleScroll() {
      const currentScrollY = window.scrollY;

      if (ticking) {
        return;
      }

      ticking = true;
      window.requestAnimationFrame(() => {
        if (currentScrollY <= 0) {
          setIsHeaderVisible(true);
        } else if (currentScrollY > lastScrollY + minimumDelta) {
          setIsHeaderVisible(false);
        } else if (currentScrollY < lastScrollY - minimumDelta) {
          setIsHeaderVisible(true);
        }

        lastScrollY = currentScrollY;
        ticking = false;
      });
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const activeMessage = activeFooterMessage ? FOOTER_MESSAGES[activeFooterMessage] : null;

  return (
    <div className="relative isolate min-h-screen overflow-x-clip bg-grain-gradient">
      <ToastHost />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-primary-100 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-900"
      >
        Skip to main content
      </a>
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 -top-36 h-96 w-96 animate-float-slow rounded-full bg-primary-800/32 blur-3xl" />
        <div className="absolute right-[-6rem] top-28 h-[26rem] w-[26rem] animate-float-slow rounded-full bg-accent-800/20 blur-3xl [animation-delay:1.6s]" />
        <div className="absolute bottom-[-10rem] left-1/3 h-80 w-80 animate-float-slow rounded-full bg-accent-700/16 blur-3xl [animation-delay:2.1s]" />
      </div>
      <header
        className={`sticky top-0 z-40  border-primary-300/55 bg-primary-50/88 transition-transform duration-300 ${
          isHeaderVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container py-4">
          <div className="surface-card border-primary-300/60 backdrop-blur-2xl bg-primary-100/72 px-4 py-4 shadow-raised sm:px-8 sm:py-6">
            <div className="flex flex-wrap items-center gap-3">
              <NavLink
                to="/"
                onClick={scrollToPageStart}
                className="group inline-flex items-center gap-3 text-primary-900"
              >
                <img
                  src={BRAND_LOGO_SRC}
                  alt={`${BRAND_NAME} logo`}
                  className="h-12 w-auto max-w-[200px] object-contain"
                />
                <span className="block text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-accent-700">
                  {BRAND_TAGLINE}
                </span>
              </NavLink>

              <p className="ml-auto hidden max-w-md text-xs font-medium text-primary-600 lg:block">
                {BRAND_POSITIONING}
              </p>
            </div>

            <div
              aria-hidden
              className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-primary-400/65 to-transparent"
            />

            <nav
              aria-label="Primary navigation"
              className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl border border-primary-300/60 bg-primary-100/74 p-2"
            >
              <NavLink to="/" className={linkClass} end onClick={scrollToPageStart}>
                Home
              </NavLink>
              <NavLink to="/cart" className={linkClass}>
                Cart
              </NavLink>

              {authed && (
                <NavLink to="/orders" className={linkClass}>
                  Orders
                </NavLink>
              )}

              {authed && (
                <NavLink to="/wishlist" className={linkClass}>
                  <span className="inline-flex items-center gap-2">
                    <span>Wishlist</span>
                    <span className="inline-flex min-w-[1.45rem] items-center justify-center rounded-full border border-current/40 px-1.5 py-0.5 text-[10px] font-bold leading-none">
                      {wishlistCountLabel}
                    </span>
                  </span>
                </NavLink>
              )}

              {user?.role === "ADMIN" && (
                <NavLink to="/admin" className={linkClass}>
                  Admin
                </NavLink>
              )}

              <div className="ml-auto flex items-center gap-2">
                {authed ? (
                  <>
                    <div className="hidden items-center gap-2 rounded-full border border-accent-700/45 bg-primary-100/70 px-3 py-1.5 text-xs font-semibold text-primary-700 sm:inline-flex">
                      <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-accent-600" />
                      {displayName || user?.email}
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="inline-flex items-center justify-center rounded-full border border-primary-400/75 bg-primary-100/78 px-4 py-2 text-sm font-semibold text-primary-800 transition hover:-translate-y-0.5 hover:border-accent-700/75 hover:text-primary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-700"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <NavLink to="/login" className={linkClass}>
                      Login
                    </NavLink>
                    <NavLink to="/register" className={linkClass}>
                      Register
                    </NavLink>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>
      <main id="main-content" className="container py-8 md:py-10">
        <Outlet />
      </main>
      <footer className="mt-10 border-t border-primary-300/60 bg-primary-100/76 py-10 backdrop-blur-md">
        <div className="container space-y-8">
          <div className="grid gap-8 md:grid-cols-3">
            <section>
              <img
                src={BRAND_LOGO_SRC}
                alt={`${BRAND_NAME} logo`}
                className="h-14 w-auto max-w-full object-contain object-left"
              />
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-accent-700">
                {BRAND_TAGLINE}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-primary-600">{BRAND_POSITIONING}</p>
            </section>

            <section className="text-center">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-700">
                Support
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-primary-600">
                <li>
                  <button
                    type="button"
                    onClick={() => openFooterMessage("helpCenter")}
                    className="bg-transparent text-primary-600 transition-colors hover:text-accent-700 focus-visible:outline-none focus-visible:text-accent-700"
                  >
                    Help Center
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openFooterMessage("orderTracking")}
                    className="bg-transparent text-primary-600 transition-colors hover:text-accent-700 focus-visible:outline-none focus-visible:text-accent-700"
                  >
                    Order Tracking
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openFooterMessage("contactSupport")}
                    className="bg-transparent text-primary-600 transition-colors hover:text-accent-700 focus-visible:outline-none focus-visible:text-accent-700"
                  >
                    Contact Support
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openFooterMessage("warrantyClaims")}
                    className="bg-transparent text-primary-600 transition-colors hover:text-accent-700 focus-visible:outline-none focus-visible:text-accent-700"
                  >
                    Warranty Claims
                  </button>
                </li>
              </ul>
            </section>

            <section className="text-center">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-700">
                Policies
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-primary-600">
                <li>
                  <button
                    type="button"
                    onClick={() => openFooterMessage("shippingPolicy")}
                    className="bg-transparent text-primary-600 transition-colors hover:text-accent-700 focus-visible:outline-none focus-visible:text-accent-700"
                  >
                    Shipping Policy
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openFooterMessage("returnsRefunds")}
                    className="bg-transparent text-primary-600 transition-colors hover:text-accent-700 focus-visible:outline-none focus-visible:text-accent-700"
                  >
                    Returns & Refunds
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openFooterMessage("privacySecurity")}
                    className="bg-transparent text-primary-600 transition-colors hover:text-accent-700 focus-visible:outline-none focus-visible:text-accent-700"
                  >
                    Privacy & Security
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openFooterMessage("termsOfService")}
                    className="bg-transparent text-primary-600 transition-colors hover:text-accent-700 focus-visible:outline-none focus-visible:text-accent-700"
                  >
                    Terms of Service
                  </button>
                </li>
              </ul>
            </section>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-primary-300/50 pt-4 text-xs font-semibold uppercase tracking-[0.16em] text-primary-600">
            <p>PCI secured checkout</p>
            <p>Visa • Mastercard • PayPal • Apple Pay • Google Pay</p>
            <p>Free returns in 30 days</p>
          </div>

          <p className="text-right text-xs font-medium text-primary-600">
            Created by
            <strong>
              <a
                href="https://www.linkedin.com/in/ioannis-tountas/"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-accent-700 underline underline-offset-2 transition-colors hover:text-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-700"
              >
                John Tountas
              </a>
            </strong>
            . Copyright {currentYear}. All rights reserved.
          </p>
        </div>
      </footer>

      {activeMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Close message"
            onClick={closeFooterMessage}
            className="absolute inset-0 bg-primary-950/70 backdrop-blur-sm"
          />
          <article className="relative z-10 w-full max-w-2xl rounded-2xl border border-primary-300/70 bg-primary-100/95 p-6 shadow-raised sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-700">
              {activeMessage.section}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-primary-900">{activeMessage.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-primary-700">{activeMessage.body}</p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={closeFooterMessage}
                className="rounded-full bg-primary-800 px-5 py-2 text-sm font-semibold text-white shadow-neon hover:bg-primary-500"
              >
                Close
              </button>
            </div>
          </article>
        </div>
      )}
    </div>
  );
}

export default Layout;
