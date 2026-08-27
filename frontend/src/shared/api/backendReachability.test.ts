// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { hasBackendBeenReachable, markBackendReachable } from "./backendReachability";

describe("backendReachability", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    window.localStorage.clear();
  });

  it("stores a recent reachability timestamp", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-27T00:00:00.000Z"));

    markBackendReachable();

    expect(hasBackendBeenReachable()).toBe(true);
  });

  it("expires the cached reachability signal after the ttl window", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-27T00:00:00.000Z"));
    markBackendReachable();

    vi.setSystemTime(new Date("2026-08-27T00:16:00.000Z"));

    expect(hasBackendBeenReachable()).toBe(false);
  });
});
