export const POCKET_HAUL_SIZE = 5;
export const STEAM_SPECIALS_TTL_SECONDS = 900;
export const STEAM_SPECIALS_URL =
  "https://store.steampowered.com/api/featuredcategories/?cc=us&l=english";

const STEAM_IMAGE_HOST = "shared.akamai.steamstatic.com";
const STEAM_RESPONSE_LIMIT_BYTES = 1_000_000;

type JsonRecord = Record<string, unknown>;

export type PocketHaulItem = {
  appId: number;
  name: string;
  discountPercent: number;
  originalPriceCents: number;
  finalPriceCents: number;
  currency: string;
  imageUrl: string;
  storeUrl: string;
};

export type PocketHaulResult =
  | { status: "ready"; items: PocketHaulItem[] }
  | { status: "empty" | "unavailable"; items: [] };

type SteamFeedFetcher = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return (
    typeof value === "number" && Number.isSafeInteger(value) && value >= 0
  );
}

function normalizeSteamImage(value: unknown, appId: number): string | null {
  if (typeof value !== "string") {
    return null;
  }

  try {
    const url = new URL(value);
    const appAssetPath = `/store_item_assets/steam/apps/${appId}/`;

    if (
      url.protocol !== "https:" ||
      url.hostname !== STEAM_IMAGE_HOST ||
      url.port !== "" ||
      url.username !== "" ||
      url.password !== "" ||
      !url.pathname.startsWith(appAssetPath)
    ) {
      return null;
    }

    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

function parseSpecial(value: unknown): PocketHaulItem | null {
  if (!isRecord(value)) {
    return null;
  }

  const appId = value.id;
  const originalPriceCents = value.original_price;
  const finalPriceCents = value.final_price;
  const discountPercent = value.discount_percent;
  const name = typeof value.name === "string" ? value.name.trim() : "";
  const currency = typeof value.currency === "string" ? value.currency : "";

  if (
    value.type !== 0 ||
    value.discounted !== true ||
    !isPositiveInteger(appId) ||
    name.length === 0 ||
    name.length > 200 ||
    !isNonNegativeInteger(originalPriceCents) ||
    !isNonNegativeInteger(finalPriceCents) ||
    finalPriceCents >= originalPriceCents ||
    !isPositiveInteger(discountPercent) ||
    discountPercent > 100 ||
    !/^[A-Z]{3}$/.test(currency)
  ) {
    return null;
  }

  const imageUrl =
    normalizeSteamImage(value.large_capsule_image, appId) ??
    normalizeSteamImage(value.header_image, appId);

  if (!imageUrl) {
    return null;
  }

  return {
    appId,
    name,
    discountPercent,
    originalPriceCents,
    finalPriceCents,
    currency,
    imageUrl,
    storeUrl: `https://store.steampowered.com/app/${appId}/`,
  };
}

/**
 * Steam already curates and orders the specials list. Keeping that order makes
 * one feed snapshot map to the same five slots without random or user-specific
 * reshuffling.
 */
export function selectPocketHaul(
  payload: unknown,
): PocketHaulItem[] | null {
  if (!isRecord(payload) || payload.status !== 1) {
    return null;
  }

  const specials = payload.specials;
  if (
    !isRecord(specials) ||
    specials.id !== "cat_specials" ||
    !Array.isArray(specials.items)
  ) {
    return null;
  }

  const selected: PocketHaulItem[] = [];
  const seenAppIds = new Set<number>();

  for (const candidate of specials.items) {
    const item = parseSpecial(candidate);
    if (!item || seenAppIds.has(item.appId)) {
      continue;
    }

    selected.push(item);
    seenAppIds.add(item.appId);

    if (selected.length === POCKET_HAUL_SIZE) {
      break;
    }
  }

  return selected;
}

export async function getPocketHaul(
  fetcher: SteamFeedFetcher = fetch,
): Promise<PocketHaulResult> {
  const requestInit: RequestInit & {
    next: { revalidate: number };
  } = {
    cache: "force-cache",
    headers: {
      Accept: "application/json",
      "User-Agent":
        "VaultQuest Pocket Haul/1.0 (+https://www.vaultquest.io/haul)",
    },
    next: { revalidate: STEAM_SPECIALS_TTL_SECONDS },
    signal: AbortSignal.timeout(5_000),
  };

  try {
    const response = await fetcher(STEAM_SPECIALS_URL, requestInit);
    if (!response.ok) {
      return { status: "unavailable", items: [] };
    }

    const contentLength = Number(response.headers.get("content-length"));
    if (
      Number.isFinite(contentLength) &&
      contentLength > STEAM_RESPONSE_LIMIT_BYTES
    ) {
      return { status: "unavailable", items: [] };
    }

    const body = await response.text();
    if (Buffer.byteLength(body, "utf8") > STEAM_RESPONSE_LIMIT_BYTES) {
      return { status: "unavailable", items: [] };
    }

    const items = selectPocketHaul(JSON.parse(body));
    if (items === null) {
      return { status: "unavailable", items: [] };
    }

    return items.length > 0
      ? { status: "ready", items }
      : { status: "empty", items: [] };
  } catch {
    return { status: "unavailable", items: [] };
  }
}

export function formatSteamPrice(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}
