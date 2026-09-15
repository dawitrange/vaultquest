import assert from "node:assert/strict";
import test from "node:test";
import {
  getPocketHaul,
  POCKET_HAUL_SIZE,
  selectPocketHaul,
  STEAM_SPECIALS_TTL_SECONDS,
  STEAM_SPECIALS_URL,
} from "./steam-specials";

function steamSpecial(id: number, overrides: Record<string, unknown> = {}) {
  return {
    id,
    type: 0,
    name: `Steam game ${id}`,
    discounted: true,
    discount_percent: 25,
    original_price: 1999,
    final_price: 1499,
    currency: "USD",
    large_capsule_image: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${id}/capsule_616x353.jpg?t=feed-snapshot`,
    ...overrides,
  };
}

function steamFeed(items: unknown[]) {
  return {
    status: 1,
    specials: {
      id: "cat_specials",
      name: "Specials",
      items,
    },
  };
}

test("one feed snapshot deterministically fills the same five slots", () => {
  const snapshot = steamFeed(
    Array.from({ length: POCKET_HAUL_SIZE + 2 }, (_, index) =>
      steamSpecial(index + 1),
    ),
  );

  const firstSelection = selectPocketHaul(snapshot);
  const secondSelection = selectPocketHaul(snapshot);

  assert.deepEqual(firstSelection, secondSelection);
  assert.deepEqual(
    firstSelection?.map((item) => item.appId),
    [1, 2, 3, 4, 5],
  );
  assert.equal(firstSelection?.length, POCKET_HAUL_SIZE);
  assert.equal(
    firstSelection?.[0].storeUrl,
    "https://store.steampowered.com/app/1/",
  );
  assert.equal(
    firstSelection?.[0].imageUrl,
    "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1/capsule_616x353.jpg",
  );
});

test("selection rejects packages, malformed deals, duplicate apps, and foreign image hosts", () => {
  const result = selectPocketHaul(
    steamFeed([
      steamSpecial(10, { type: 1 }),
      steamSpecial(11, { final_price: 1999 }),
      steamSpecial(12, {
        large_capsule_image:
          "https://key-shop.example/store_item_assets/steam/apps/12/capsule.jpg",
      }),
      steamSpecial(13),
      steamSpecial(13, { name: "Duplicate app" }),
      steamSpecial(14),
    ]),
  );

  assert.deepEqual(
    result?.map((item) => item.appId),
    [13, 14],
  );
});

test("valid empty specials stay empty while invalid feed shapes fail validation", () => {
  assert.deepEqual(selectPocketHaul(steamFeed([])), []);
  assert.equal(selectPocketHaul({ status: 1 }), null);
  assert.equal(
    selectPocketHaul({
      status: 0,
      specials: { id: "cat_specials", items: [] },
    }),
    null,
  );
});

test("feed request uses the public endpoint and a fifteen-minute cache TTL", async () => {
  let requestedUrl: string | URL | Request | undefined;
  let requestedInit: RequestInit | undefined;

  const result = await getPocketHaul(async (url, init) => {
    requestedUrl = url;
    requestedInit = init;
    return new Response(JSON.stringify(steamFeed([steamSpecial(21)])), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  });

  assert.equal(result.status, "ready");
  assert.equal(result.items.length, 1);
  assert.equal(requestedUrl, STEAM_SPECIALS_URL);
  assert.equal(requestedInit?.cache, "force-cache");
  assert.equal(
    (
      requestedInit as RequestInit & {
        next: { revalidate: number };
      }
    ).next.revalidate,
    STEAM_SPECIALS_TTL_SECONDS,
  );
});

test("empty, unavailable, and invalid responses never invent inventory", async () => {
  const empty = await getPocketHaul(async () => {
    return new Response(JSON.stringify(steamFeed([])), { status: 200 });
  });
  const unavailable = await getPocketHaul(async () => {
    return new Response("upstream unavailable", { status: 503 });
  });
  const invalid = await getPocketHaul(async () => {
    return new Response("{not-json", { status: 200 });
  });
  const failed = await getPocketHaul(async () => {
    throw new Error("network failure");
  });

  assert.deepEqual(empty, { status: "empty", items: [] });
  assert.deepEqual(unavailable, { status: "unavailable", items: [] });
  assert.deepEqual(invalid, { status: "unavailable", items: [] });
  assert.deepEqual(failed, { status: "unavailable", items: [] });
});
