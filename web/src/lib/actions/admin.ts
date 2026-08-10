"use server";

import { revalidatePath } from "next/cache";
import { AffiliateHealth, RedemptionStatus } from "@prisma/client";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export type AdminState = { error?: string; ok?: boolean; message?: string };

export async function updateAffiliateAction(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  if (!(await requireAdmin())) return { error: "Admin only" };

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as AffiliateHealth;
  const priority = Number(formData.get("priority") ?? 1);
  const capRaw = String(formData.get("capDaily") ?? "");
  const url = String(formData.get("url") ?? "");
  const partner = String(formData.get("partner") ?? "");

  if (!id || !["healthy", "capped", "disabled"].includes(status)) {
    return { error: "Invalid affiliate update" };
  }

  await prisma.affiliateLink.update({
    where: { id },
    data: {
      status,
      priority: Number.isFinite(priority) ? priority : 1,
      capDaily: capRaw === "" ? null : Number(capRaw),
      url: url || undefined,
      partner: partner || undefined,
    },
  });

  revalidatePath("/admin");
  return { ok: true, message: "Affiliate link updated" };
}

export async function fulfillRedemptionAction(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  if (!(await requireAdmin())) return { error: "Admin only" };

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as RedemptionStatus;
  const fulfillNote = String(formData.get("fulfillNote") ?? "") || null;
  const deliveryCode = String(formData.get("deliveryCode") ?? "") || null;

  if (!id || !["REQUESTED", "FULFILLING", "FULFILLED", "CANCELLED"].includes(status)) {
    return { error: "Invalid fulfillment update" };
  }

  await prisma.redemption.update({
    where: { id },
    data: {
      status,
      fulfillNote,
      deliveryCode,
      fulfilledAt: status === "FULFILLED" ? new Date() : null,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/account");
  return { ok: true, message: "Redemption updated" };
}

export async function markContactReadAction(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  if (!(await requireAdmin())) return { error: "Admin only" };
  const id = String(formData.get("id") ?? "");
  await prisma.contactMessage.update({
    where: { id },
    data: { status: "READ" },
  });
  revalidatePath("/admin");
  return { ok: true };
}

const createLinkSchema = z.object({
  slug: z.string().min(2).max(64),
  partner: z.string().min(1),
  url: z.string().url(),
  category: z.enum([
    "offerwall_primary",
    "offerwall_backup",
    "survey_wall",
    "cpa_signup",
    "cpe_play",
  ]),
  priority: z.coerce.number().int().min(1).max(100),
  capDaily: z.coerce.number().int().positive().optional(),
});

export async function createAffiliateAction(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  if (!(await requireAdmin())) return { error: "Admin only" };

  const capRaw = String(formData.get("capDaily") ?? "").trim();
  const parsed = createLinkSchema.safeParse({
    slug: formData.get("slug"),
    partner: formData.get("partner"),
    url: formData.get("url"),
    category: formData.get("category"),
    priority: formData.get("priority") || 1,
    capDaily: capRaw === "" ? undefined : Number(capRaw),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid link" };

  await prisma.affiliateLink.create({
    data: {
      ...parsed.data,
      status: "healthy",
    },
  });

  revalidatePath("/admin");
  return { ok: true, message: "Link created" };
}
