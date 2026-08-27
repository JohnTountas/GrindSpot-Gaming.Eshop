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
    phaseLabel: "Grindspot goes Live",
    title: "Loading in progress...",
    statusMessage: "Connecting to the live session.",
    detailMessage: "Services are coming online...",
  },
  waking: {
    phaseLabel: "Backend's almost ready",
    title: "Loading in progress...",
    statusMessage: "Fetching data from the Database...",
    detailMessage: "Backend is now serving to the frontpage...",
  },
};

export function getBackendWarmupContent(state: WarmupState): BackendWarmupContent {
  return WARMUP_CONTENT[state];
}
