export type WarmupState = "checking" | "waking";

interface BackendWarmupContent {
  phaseLabel: string;
  title: string;
  statusMessage: string;
  detailMessage: string;
}

const WARMUP_CONTENT: Record<WarmupState, BackendWarmupContent> = {
  checking: {
    phaseLabel: "Storefront link-up",
    title: "Loading the arena",
    statusMessage: "Syncing the live storefront session.",
    detailMessage: "Verified services are coming online...",
  },
  waking: {
    phaseLabel: "Backend warmup",
    title: "Loading the arena",
    statusMessage: "Waking up the live catalog...",
    detailMessage: "This usually clears as soon as GrindSpot reconnects to the production stack.",
  },
};

export function getBackendWarmupContent(state: WarmupState): BackendWarmupContent {
  return WARMUP_CONTENT[state];
}
