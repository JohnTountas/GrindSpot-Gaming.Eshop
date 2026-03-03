/**
 * Shared storefront logic for metadata, social proof, and user storefront state.
 */
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api/client";
import { isAuthenticated } from "@/lib/auth/session";
import { Product } from "@/types";

type ProductLike = Pick<Product, "id" | "title" | "price"> & {
  category?: {
    name?: string;
    slang?: string;
  };
};

type StorefrontState = {
  wishlistProductIds: string[];
  compareProductIds: string[];
  compareLimit: number;
};

type StorefrontToggleResult = {
  added: boolean;
  ids: string[];
  reachedLimit: boolean;
};

type StorefrontToggleResponse = StorefrontState & {
  added: boolean;
  reachedLimit?: boolean;
};

const STOREFRONT_QUERY_KEY = ["storefront-state"];
const GUEST_COMPARE_STORAGE_KEY = "guestCompareProductIds";
const TWO_WORD_BRANDS = new Map<string, string>([["cooler master", "Cooler Master"]]);

const ONE_WORD_BRANDS: Record<string, string> = {
  vengeance: "Vengeance",
  ajazz: "Ajazz",
  msi: "MSI",
  corsair: "Corsair",
  dell: "Dell",
  hyperx: "HyperX",
  keychron: "Keychron",
  lg: "LG",
  logitech: "Logitech",
  razer: "Razer",
  ryzen: "Ryzen",
  samsung: "Samsung",
  steelseries: "SteelSeries",
  xiaomi: "Xiaomi",
};

const DEFAULT_STOREFRONT_STATE: StorefrontState = {
  wishlistProductIds: [],
  compareProductIds: [],
  compareLimit: 4,
};

// Loads guest compare ids from local storage with defensive parsing.
function readGuestCompareIds(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = localStorage.getItem(GUEST_COMPARE_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      localStorage.removeItem(GUEST_COMPARE_STORAGE_KEY);
      return [];
    }

    const normalized = parsed.filter((item): item is string => typeof item === "string");
    return [...new Set(normalized)].slice(0, DEFAULT_STOREFRONT_STATE.compareLimit);
  } catch {
    localStorage.removeItem(GUEST_COMPARE_STORAGE_KEY);
    return [];
  }
}

// Persists guest compare ids and emits sync events for other listeners.
function persistGuestCompareIds(ids: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(GUEST_COMPARE_STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent("storefront:guest-compare-updated"));
}

// Clears guest compare ids and emits sync events for other listeners.
function clearGuestCompareIds() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(GUEST_COMPARE_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("storefront:guest-compare-updated"));
}

// Produces a stable numeric hash used for deterministic mock metadata generation.
function hashValue(input: string): number {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}

// Normalizes product title text into clean tokens for brand inference.
function normalizeTitleTokens(title: string): string[] {
  return title
    .replace(/[_/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((token) => token.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, ""))
    .filter(Boolean);
}

// Converts raw token fragments into title-cased display values.
function toTitleCase(value: string): string {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join("-");
}

// Fetches authenticated storefront state shared by wishlist and compare hooks.
function useStorefrontState() {
  const authed = isAuthenticated();

  return useQuery({
    queryKey: STOREFRONT_QUERY_KEY,
    queryFn: async () => (await api.get<StorefrontState>("/me/storefront")).data,
    enabled: authed,
    staleTime: 30_000,
  });
}

// Provides wishlist ids and mutation helpers backed by the storefront API.
export function useWishlist() {
  const queryClient = useQueryClient();
  const storefrontQuery = useStorefrontState();
  const ids =
    storefrontQuery.data?.wishlistProductIds ?? DEFAULT_STOREFRONT_STATE.wishlistProductIds;

  const toggleMutation = useMutation({
    mutationFn: async (productId: string) =>
      (await api.post<StorefrontToggleResponse>("/me/wishlist/toggle", { productId })).data,
    onSuccess: async (data) => {
      queryClient.setQueryData(STOREFRONT_QUERY_KEY, data);
      await queryClient.invalidateQueries({ queryKey: ["wishlist-products"] });
    },
  });

  return {
    ids,
    isLoading: storefrontQuery.isLoading || toggleMutation.isPending,
    async toggle(productId: string): Promise<StorefrontToggleResult> {
      const response = await toggleMutation.mutateAsync(productId);
      return {
        added: response.added,
        ids: response.wishlistProductIds,
        reachedLimit: false,
      };
    },
    clear() {
      // Wishlist is toggled item-by-item in the current UX.
    },
  };
}

// Provides compare ids and toggle/clear behavior for both guest and authenticated users.
export function useCompare() {
  const authed = isAuthenticated();
  const queryClient = useQueryClient();
  const storefrontQuery = useStorefrontState();
  const [guestIds, setGuestIds] = useState<string[]>(() => (authed ? [] : readGuestCompareIds()));
  const compareLimit = storefrontQuery.data?.compareLimit ?? DEFAULT_STOREFRONT_STATE.compareLimit;

  useEffect(() => {
    if (authed || typeof window === "undefined") {
      return;
    }

    const syncFromStorage = () => setGuestIds(readGuestCompareIds());
    syncFromStorage();

    window.addEventListener("storefront:guest-compare-updated", syncFromStorage);
    window.addEventListener("storage", syncFromStorage);

    return () => {
      window.removeEventListener("storefront:guest-compare-updated", syncFromStorage);
      window.removeEventListener("storage", syncFromStorage);
    };
  }, [authed]);

  const ids = authed
    ? (storefrontQuery.data?.compareProductIds ?? DEFAULT_STOREFRONT_STATE.compareProductIds)
    : guestIds;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const compareApiBase = (
      api.defaults.baseURL ??
      import.meta.env.VITE_API_URL ??
      "http://localhost:5000/api"
    ).replace(/\/$/, "");
    const compareClearUrl = `${compareApiBase}/me/compare`;
    let ClearOnClose = false;

    // Clears compare state when the browser or the tab/window is closed.
    function clearOnWindowClose() {
      if (ClearOnClose) {
        return;
      }
      ClearOnClose = true;

      if (!authed) {
        clearGuestCompareIds();
        return;
      }

      if (ids.length === 0) {
        return;
      }

      const token = localStorage.getItem("accessToken");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      void fetch(compareClearUrl, {
        method: "DELETE",
        headers,
        credentials: "include",
        keepalive: true,
      });
    }

    window.addEventListener("beforeunload", clearOnWindowClose);
    window.addEventListener("pagehide", clearOnWindowClose);

    return () => {
      window.removeEventListener("beforeunload", clearOnWindowClose);
      window.removeEventListener("pagehide", clearOnWindowClose);
    };
  }, [authed, ids]);

  const toggleMutation = useMutation({
    mutationFn: async (productId: string) =>
      (await api.post<StorefrontToggleResponse>("/me/compare/toggle", { productId })).data,
    onSuccess: (data) => {
      queryClient.setQueryData(STOREFRONT_QUERY_KEY, data);
    },
  });

  const clearMutation = useMutation({
    mutationFn: async () => (await api.delete<StorefrontState>("/me/compare")).data,
    onSuccess: (data) => {
      queryClient.setQueryData(STOREFRONT_QUERY_KEY, data);
    },
  });

  return {
    ids,
    isLoading: storefrontQuery.isLoading || toggleMutation.isPending || clearMutation.isPending,
    async toggle(productId: string): Promise<StorefrontToggleResult> {
      if (!authed) {
        const exists = guestIds.includes(productId);
        let reachedLimit = false;
        let nextIds: string[];

        if (exists) {
          nextIds = guestIds.filter((id) => id !== productId);
        } else if (guestIds.length >= compareLimit) {
          reachedLimit = true;
          nextIds = [...guestIds.slice(1), productId];
        } else {
          nextIds = [...guestIds, productId];
        }

        setGuestIds(nextIds);
        persistGuestCompareIds(nextIds);

        return {
          added: !exists,
          ids: nextIds,
          reachedLimit,
        };
      }

      const response = await toggleMutation.mutateAsync(productId);
      return {
        added: response.added,
        ids: response.compareProductIds,
        reachedLimit: Boolean(response.reachedLimit),
      };
    },
    clear() {
      if (!authed) {
        setGuestIds([]);
        clearGuestCompareIds();
        return;
      }
      clearMutation.mutate();
    },
  };
}

// Infers a display brand from product title conventions and mapping rules.
export function getProductBrand(product: ProductLike) {
  const tokens = normalizeTitleTokens(product.title);
  if (tokens.length === 0) {
    return "Generic";
  }

  if (tokens.length > 1) {
    const firstTwoWords = `${tokens[0]} ${tokens[1]}`.toLowerCase();
    const twoWordBrand = TWO_WORD_BRANDS.get(firstTwoWords);
    if (twoWordBrand) {
      return twoWordBrand;
    }
  }

  const firstWord = tokens[0].toLowerCase();
  return ONE_WORD_BRANDS[firstWord] ?? toTitleCase(tokens[0]);
}

// Derives platform compatibility tags from product category semantics.
export function getCompatibilityTags(product: ProductLike) {
  const category = `${product.category?.name ?? ""} ${product.category?.slang ?? ""}`.toLowerCase();

  if (category.includes("desktop") || category.includes("pc")) {
    return ["PC"];
  }
  if (category.includes("monitor")) {
    return ["PC", "PlayStation 5", "Xbox Series X|S"];
  }
  if (category.includes("headset")) {
    return ["PC", "PlayStation 5", "Xbox Series X|S", "Switch"];
  }
  if (category.includes("keyboard") || category.includes("mouse")) {
    return ["PC", "Mac", "PlayStation 5"];
  }

  return ["Universal"];
}

// Generates deterministic fallback specs when canonical specs are unavailable.
export function buildTechnicalSpecs(product: ProductLike) {
  const seed = hashValue(`${product.id}:${product.title}`);
  const category = `${product.category?.name ?? ""} ${product.category?.slang ?? ""}`.toLowerCase();

  if (category.includes("desktop") || category.includes("pc")) {
    const cpu = ["Ryzen 9 9900X", "Core i9-14900K", "Ryzen 7 9800X3D"][seed % 3];
    const gpu = ["RTX 5080", "RTX 5070 Ti", "RX 8900 XT"][seed % 3];
    const ram = ["32GB DDR5 6000MHz", "64GB DDR5 5600MHz", "32GB DDR5 6400MHz"][seed % 3];
    const storage = ["2TB NVMe Gen4", "1TB NVMe Gen5 + 2TB SSD", "4TB NVMe Gen4"][seed % 3];

    return [
      { label: "CPU", value: cpu },
      { label: "GPU", value: gpu },
      { label: "Memory", value: ram },
      { label: "Storage", value: storage },
      {
        label: "Cooling",
        value: ["360mm AIO", "Dual-tower air cooler", "Custom liquid loop"][seed % 3],
      },
      { label: "Warranty", value: "36 months pickup & return" },
    ];
  }

  if (category.includes("monitor")) {
    return [
      { label: "Panel Type", value: ["Fast IPS", "OLED", "Mini-LED"][seed % 3] },
      { label: "Resolution", value: ["2560x1440", "3840x2160", "3440x1440"][seed % 3] },
      { label: "Refresh Rate", value: ["165Hz", "240Hz", "360Hz"][seed % 3] },
      { label: "Response Time", value: ["0.03ms", "0.5ms", "1ms"][seed % 3] },
      { label: "Adaptive Sync", value: "AMD FreeSync Premium / G-SYNC Compatible" },
      { label: "Connectivity", value: "HDMI 2.1, DisplayPort 1.4, USB-C" },
    ];
  }

  if (category.includes("keyboard")) {
    return [
      { label: "Switch Type", value: ["Linear", "Tactile", "Magnetic Hall-Effect"][seed % 3] },
      { label: "Layout", value: ["60%", "75%", "TKL"][seed % 3] },
      { label: "Connectivity", value: ["USB-C", "2.4GHz + USB-C", "Tri-mode"][seed % 3] },
      { label: "Polling Rate", value: ["1000Hz", "4000Hz", "8000Hz"][seed % 3] },
      { label: "Keycaps", value: "Double-shot PBT" },
      { label: "Software", value: "Macro mapping and per-key RGB profiles" },
    ];
  }

  if (category.includes("mouse")) {
    return [
      { label: "Sensor", value: ["PixArt PAW3395", "PixArt PAW3950", "Focus Pro"][seed % 3] },
      { label: "Max DPI", value: ["26000 DPI", "30000 DPI", "36000 DPI"][seed % 3] },
      { label: "Weight", value: ["54g", "63g", "72g"][seed % 3] },
      { label: "Polling Rate", value: ["1000Hz", "4000Hz", "8000Hz"][seed % 3] },
      { label: "Switches", value: "Optical 90M click lifecycle" },
      { label: "Connectivity", value: ["Wired", "Wireless 2.4GHz", "Dual-mode"][seed % 3] },
    ];
  }

  if (category.includes("headset")) {
    return [
      { label: "Driver Size", value: ["40mm", "50mm", "53mm"][seed % 3] },
      {
        label: "Microphone",
        value: ["Detachable cardioid", "Flip-to-mute boom", "Broadcast-grade boom"][seed % 3],
      },
      { label: "Surround", value: ["Stereo", "Virtual 7.1", "Spatial 3D"][seed % 3] },
      { label: "Battery", value: ["40 hours", "55 hours", "70 hours"][seed % 3] },
      { label: "Connection", value: ["USB-C", "2.4GHz Wireless", "Bluetooth + 2.4GHz"][seed % 3] },
      { label: "Weight", value: ["245g", "278g", "301g"][seed % 3] },
    ];
  }

  return [
    { label: "Build", value: "Premium gaming-grade construction" },
    { label: "Performance", value: "Validated for competitive workloads" },
    { label: "Reliability", value: "Quality-tested before dispatch" },
  ];
}

// Generates deterministic social-proof summary data for products without reviews.
export function buildReviewSnapshot(product: ProductLike) {
  const seed = hashValue(`${product.id}:${product.title}:reviews`);
  const rating = Number((4.2 + (seed % 8) * 0.1).toFixed(1));
  const totalReviews = 84 + (seed % 420);

  const fiveStar = Math.round(totalReviews * (0.52 + (seed % 10) * 0.02));
  const fourStar = Math.round(totalReviews * (0.26 + (seed % 6) * 0.01));
  const threeStar = Math.round(totalReviews * 0.11);
  const twoStar = Math.round(totalReviews * 0.06);
  const oneStar = Math.max(1, totalReviews - fiveStar - fourStar - threeStar - twoStar);

  const counts = [fiveStar, fourStar, threeStar, twoStar, oneStar];
  const breakdown = [5, 4, 3, 2, 1].map((stars, index) => ({
    stars,
    count: counts[index],
    percent: Math.round((counts[index] / totalReviews) * 100),
  }));

  const quotes = [
    "Frame consistency improved immediately after setup.",
    "Build quality and packaging exceeded expectations.",
    "Fast delivery and zero setup friction.",
  ];

  return {
    rating,
    totalReviews,
    breakdown,
    quotes,
  };
}
