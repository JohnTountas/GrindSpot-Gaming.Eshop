import { describe, expect, it } from "vitest";
import { getBackendWarmupContent } from "./backendWarmupContent";

describe("backendWarmupContent", () => {
  it("returns storefront-focused copy for the initial readiness phase", () => {
    expect(getBackendWarmupContent("checking")).toEqual({
      phaseLabel: "Storefront",
      title: "Loading Grindspot",
      statusMessage: "Connecting to the live session.",
      detailMessage: "Services are coming online.",
    });
  });

  it("returns warmup-focused copy for the retry phase", () => {
    expect(getBackendWarmupContent("waking")).toEqual({
      phaseLabel: "Backend warmup",
      title: "Loading Grindspot",
      statusMessage: "Waking the live catalog.",
      detailMessage: "-Please refresh your browser if products don't appear.-",
    });
  });
});

// describe("backendWarmupContent", () => {
//   it("returns storefront-focused copy for the initial readiness phase", () => {
//     expect(getBackendWarmupContent("checking")).toEqual({
//       phaseLabel: "Storefront link-up",
//       title: "Grindspot is loading",
//       statusMessage: "Syncing the live session.",
//       detailMessage: "Verified services are coming online...",
//     });
//   });

//   it("returns warmup-focused copy for the retry phase", () => {
//     expect(getBackendWarmupContent("waking")).toEqual({
//       phaseLabel: "Backend warmup",
//       title: "Grindspot is loading",
//       statusMessage: "Waking up the live catalog...",
//       detailMessage: "Please refresh your browser if you can't see the products !",
//     });
//   });
// });
