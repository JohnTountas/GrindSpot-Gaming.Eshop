import { describe, expect, it } from "vitest";
import { shouldRecoverBackendQuery } from "./useBackendReachabilityRecovery";

function createQuerySnapshot(overrides?: {
  observers?: number;
  status?: "pending" | "error" | "success";
  fetchStatus?: "idle" | "fetching" | "paused";
  data?: unknown;
}) {
  return {
    getObserversCount: () => overrides?.observers ?? 1,
    state: {
      status: overrides?.status ?? "success",
      fetchStatus: overrides?.fetchStatus ?? "idle",
      data: overrides?.data,
    },
  };
}

describe("shouldRecoverBackendQuery", () => {
  it("recovers active queries that failed while the backend was still waking up", () => {
    expect(
      shouldRecoverBackendQuery(
        createQuerySnapshot({
          status: "error",
          fetchStatus: "idle",
        })
      )
    ).toBe(true);
  });

  it("recovers active queries that still have no data after the backend comes online", () => {
    expect(
      shouldRecoverBackendQuery(
        createQuerySnapshot({
          status: "pending",
          fetchStatus: "idle",
          data: undefined,
        })
      )
    ).toBe(true);
  });

  it("skips queries that are already refetching or no longer observed", () => {
    expect(
      shouldRecoverBackendQuery(
        createQuerySnapshot({
          status: "error",
          fetchStatus: "fetching",
        })
      )
    ).toBe(false);

    expect(
      shouldRecoverBackendQuery(
        createQuerySnapshot({
          observers: 0,
          status: "error",
          fetchStatus: "idle",
        })
      )
    ).toBe(false);
  });
});
