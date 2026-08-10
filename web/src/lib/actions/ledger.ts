"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { getQuest } from "@/lib/affiliates";
import { creditEarn, requestRedeem } from "@/lib/ledger";
import { SITE } from "@/lib/site";

export type ActionState = { error?: string; ok?: boolean; message?: string };

export async function demoCompleteQuestAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sign in required" };

  const questId = String(formData.get("questId") ?? "");
  const quest = getQuest(questId);
  if (!quest) return { error: "Unknown quest" };

  await creditEarn({
    userId: session.user.id,
    vp: quest.vpReward,
    questId: quest.id,
    note: `Demo postback: ${quest.title}`,
    holdDays: 0,
  });

  revalidatePath("/account");
  revalidatePath("/rewards");
  revalidatePath("/earn");
  return {
    ok: true,
    message: `+${quest.vpReward} VP credited (demo — available now). Live partners use /api/postback with holds.`,
  };
}

export async function redeemAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sign in required" };

  const sku = String(formData.get("sku") ?? "");
  const catalog: Record<string, { label: string; costVp: number }> = {
    "steam-5": { label: "Steam Wallet $5", costVp: SITE.minRedeemUsd * SITE.vpPerUsd },
    "steam-10": { label: "Steam Wallet $10", costVp: 10 * SITE.vpPerUsd },
    "steam-20": { label: "Steam Wallet $20", costVp: 20 * SITE.vpPerUsd },
  };
  const item = catalog[sku];
  if (!item) return { error: "Unknown reward" };

  try {
    await requestRedeem({
      userId: session.user.id,
      sku,
      label: item.label,
      costVp: item.costVp,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Redeem failed" };
  }

  revalidatePath("/account");
  revalidatePath("/rewards");
  revalidatePath("/admin");
  return {
    ok: true,
    message: `Redeem requested for ${item.label}. Manual fulfillment within 24–48h once vault is stocked.`,
  };
}
