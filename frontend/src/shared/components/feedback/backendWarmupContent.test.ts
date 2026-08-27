import { describe, expect, it } from "vitest";
import { getBackendWarmupContent } from "./backendWarmupContent";

describe("backendWarmupContent", () => {
  it("returns storefront-focused copy for the initial readiness phase", () => {
    expect(getBackendWarmupContent("checking")).toEqual({
      phaseLabel: "Storefront link-up",
      title: "Loading the arena",
      statusMessage: "Syncing the live storefront session.",
      detailMessage: "Verified services are coming online...",
    });
  });

  it("returns warmup-focused copy for the retry phase", () => {
    expect(getBackendWarmupContent("waking")).toEqual({
      phaseLabel: "Backend warmup",
      title: "Loading the arena",
      statusMessage: "Waking up the live catalog...",
      detailMessage:
        "This usually clears as soon as GrindSpot reconnects to the production stack.",
    });
  });
});
