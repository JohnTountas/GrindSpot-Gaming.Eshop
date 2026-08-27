import { useEffect } from "react";
import type { Query, QueryClient } from "@tanstack/react-query";
import { subscribeToBackendReachable } from "./backendReachability";

interface BackendRecoverableQuery {
  getObserversCount: () => number;
  state: Pick<Query["state"], "fetchStatus" | "status" | "data">;
}

// Only retry live queries that previously failed or never resolved with data.
// This avoids the "refresh the page after warmup" problem without turning every
// successful API response into a global refetch storm.
export function shouldRecoverBackendQuery(query: BackendRecoverableQuery): boolean {
  return (
    query.getObserversCount() > 0 &&
    query.state.fetchStatus === "idle" &&
    (query.state.status === "error" || typeof query.state.data === "undefined")
  );
}

export function useBackendReachabilityRecovery(queryClient: QueryClient) {
  useEffect(() => {
    return subscribeToBackendReachable(() => {
      void queryClient.refetchQueries({
        type: "active",
        predicate: shouldRecoverBackendQuery,
      });
    });
  }, [queryClient]);
}
