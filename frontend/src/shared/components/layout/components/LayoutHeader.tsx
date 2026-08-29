import { NavLink } from "react-router-dom";
import type { User } from "@/shared/types";
import {
  BRAND_LOGO_SRC,
  BRAND_NAME,
  BRAND_POSITIONING,
  BRAND_TAGLINE,
} from "@/shared/brand/identity";
import PrimaryNavigation from "./PrimaryNavigation";

interface LayoutHeaderProps {
  authed: boolean;
  user: User | null;
  displayName: string;
  cartCountLabel: string;
  isHeaderVisible: boolean;
  wishlistCountLabel: string;
  onLogout: () => void;
  onScrollToTop: () => void;
}

// Renders the sticky global header, including brand messaging and primary navigation.
function LayoutHeader({
  authed,
  user,
  displayName,
  cartCountLabel,
  isHeaderVisible,
  wishlistCountLabel,
  onLogout,
  onScrollToTop,
}: LayoutHeaderProps) {
  return (
    <header
      className={`sticky top-0 z-40 border-primary-300/55 bg-primary-50/88 transition-transform duration-300 ${
        isHeaderVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="container py-3 sm:py-4">
        <div className="surface-card border-primary-300/60 bg-primary-100/72 px-3 py-3 shadow-raised backdrop-blur-2xl sm:px-6 sm:py-5 lg:px-8 lg:py-6">
          {/* Keep the brand lockup independent from the nav so tablet widths can
              breathe before we introduce the wider two-column desktop header. */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <NavLink
              to="/"
              onClick={onScrollToTop}
              className="group inline-flex max-w-full flex-col items-start gap-2.5 text-primary-900 sm:flex-row sm:items-center sm:gap-4 lg:max-w-[calc(100%-22rem)] lg:gap-5"
            >
              <img
                src={BRAND_LOGO_SRC}
                alt={`${BRAND_NAME} logo`}
                className="h-14 w-auto max-w-[220px] object-contain sm:h-[4rem] sm:max-w-[320px] md:h-[4.5rem] md:max-w-[360px] lg:h-[5rem] lg:max-w-[400px]"
              />
              <span className="block max-w-full pl-1 text-[0.6rem] font-bold uppercase leading-none tracking-[0.18em] text-accent-700 sm:ml-1 sm:pl-0 sm:text-[0.68rem] sm:tracking-[0.2em] md:text-[0.72rem] md:tracking-[0.22em]">
                {BRAND_TAGLINE}
              </span>
            </NavLink>

            <p className="hidden max-w-md text-sm font-bold text-primary-600 lg:block lg:text-right">
              {BRAND_POSITIONING}
            </p>
          </div>

          <div
            aria-hidden
            className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-primary-400/65 to-transparent"
          />

          <PrimaryNavigation
            authed={authed}
            user={user}
            displayName={displayName}
            cartCountLabel={cartCountLabel}
            wishlistCountLabel={wishlistCountLabel}
            onLogout={onLogout}
            onScrollToTop={onScrollToTop}
          />
        </div>
      </div>
    </header>
  );
}

export default LayoutHeader;
