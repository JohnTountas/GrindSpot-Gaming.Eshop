export type WarmupState = "checking" | "waking";

interface BackendWarmupContent {
  phaseLabel: string;
  title: string;
  statusMessage: string;
  detailMessage: string;
}

// Edit only this object when you want to change the loading-screen messages.
// `checking` is the first phase users see and `waking` appears only if the
// backend takes longer to become ready.
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
