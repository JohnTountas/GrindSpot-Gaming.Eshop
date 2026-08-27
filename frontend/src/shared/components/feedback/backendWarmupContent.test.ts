import { describe, expect, it } from "vitest";
import { getBackendWarmupContent } from "./backendWarmupContent";

describe("backendWarmupContent", () => {
  it("returns storefront-focused copy for the initial readiness phase", () => {
    expect(getBackendWarmupContent("checking")).toEqual({
      phaseLabel: "Grindspot goes Live",
      title: "Loading in progress...",
      statusMessage: "Connecting to the live session.",
      detailMessage: "Services are coming online...",
    });
  });

  it("returns warmup-focused copy for the retry phase", () => {
    expect(getBackendWarmupContent("waking")).toEqual({
      phaseLabel: "Backend's almost ready",
      title: "Loading in progress...",
      statusMessage: "Fetching data from the Database...",
      detailMessage: "Backend is now serving to the frontpage...",
    });
  });
});
