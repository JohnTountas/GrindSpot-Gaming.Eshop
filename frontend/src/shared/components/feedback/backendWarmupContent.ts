export type WarmupState = "checking" | "waking";

interface BackendWarmupContent {
  phaseLabel: string;
  title: string;
  statusMessage: string;
  detailMessage: string;
}

// Keep copy outside the component so design/content tweaks stay data-driven and
// testable without reopening the warmup control flow.
const WARMUP_CONTENT: Record<WarmupState, BackendWarmupContent> = {
  checking: {
    phaseLabel: "Storefront",
    title: "Loading Grindspot",
    statusMessage: "Connecting to the live session.",
    detailMessage: "Services are coming online...",
  },
  waking: {
    phaseLabel: "Backend warmup",
    title: "Loading Grindspot",
    statusMessage: "Waking the live catalog.",
    detailMessage: "- Please refresh your browser if products don't appear -",
  },
};

export function getBackendWarmupContent(state: WarmupState): BackendWarmupContent {
  return WARMUP_CONTENT[state];
}
