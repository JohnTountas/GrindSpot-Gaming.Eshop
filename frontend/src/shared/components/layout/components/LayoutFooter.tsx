import {
  BRAND_LOGO_SRC,
  BRAND_NAME,
  BRAND_POSITIONING,
  BRAND_TAGLINE,
} from "@/shared/brand/identity";
import { POLICY_FOOTER_LINKS, SUPPORT_FOOTER_LINKS, type FooterMessageKey } from "../constants";
import FooterLinkSection from "./FooterLinkSection";

interface LayoutFooterProps {
  currentYear: number;
  onOpenFooterMessage: (key: FooterMessageKey) => void;
}

// Renders the global footer with brand positioning and modal-backed support links.
function LayoutFooter({ currentYear, onOpenFooterMessage }: LayoutFooterProps) {
  return (
    <footer className="mt-10 border-t border-primary-300/60 bg-primary-100/76 py-10 backdrop-blur-md">
      <div className="container space-y-8">
        <div className="grid gap-8 text-center md:grid-cols-3 md:text-left">
          <section>
            <img
              src={BRAND_LOGO_SRC}
              alt={`${BRAND_NAME} logo`}
              className="mx-auto h-14 w-auto max-w-full object-contain object-left md:mx-0 md:h-16 lg:h-[4.5rem]"
            />
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-accent-700">
              {BRAND_TAGLINE}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-primary-600">{BRAND_POSITIONING}</p>
          </section>

          <FooterLinkSection
            title="Support"
            items={SUPPORT_FOOTER_LINKS}
            onOpen={onOpenFooterMessage}
          />

          <FooterLinkSection
            title="Policies"
            items={POLICY_FOOTER_LINKS}
            onOpen={onOpenFooterMessage}
          />
        </div>

        <div className="flex flex-col items-center gap-3 border-t border-accent-700/50 pt-4 text-center text-xs font-semibold uppercase tracking-[0.16em] text-primary-600 sm:flex-row sm:flex-wrap sm:justify-center md:justify-between md:text-left">
          <p className="rounded-full border border-accent-700/60 bg-primary-100/70 px-3 py-1 text-accent-700">
            PCI secured checkout
          </p>
          <p className="max-w-full text-balance">Visa • Mastercard • PayPal • Apple Pay • Google Pay</p>
          <p className="rounded-full border border-accent-700/60 bg-primary-100/70 px-3 py-1 text-accent-700">
            Free returns in 30 days
          </p>
        </div>

        <p className="text-center text-xs font-medium leading-relaxed text-primary-600 md:text-right">
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
  );
}

export default LayoutFooter;
