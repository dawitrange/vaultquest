"use server";

import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth, signIn } from "@/auth";
import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import {
  ROBLOX_GIVEAWAY_SLUG,
  ROBLOX_GIVEAWAY_WINDOW_LABEL,
  giveawayPhase,
  isGiveawayOpen,
} from "@/lib/giveaway";
import { submitSignedOutGiveaway } from "@/lib/giveaway-registration";
import { resetLinkForToken } from "@/lib/password-reset";
import { PH_EVENTS, captureServerEvent } from "@/lib/posthog-server";

export type GiveawayFormState = { error?: string; ok?: boolean; message?: string };

const reasonSchema = z.string().trim().min(8, "Write a short reason (at least 8 characters)").max(500);
const nameSchema = z.string().trim().min(1).max(80);

function closedOrUpcomingError(): GiveawayFormState {
  const phase = giveawayPhase();
  if (phase === "upcoming") {
    return { error: `Entries open ${ROBLOX_GIVEAWAY_WINDOW_LABEL}.` };
  }
  return { error: `This giveaway closed ${ROBLOX_GIVEAWAY_WINDOW_LABEL}.` };
}

async function upsertEntry(args: {
  userId: string;
  name: string;
  email: string;
  reason: string;
}): Promise<"created" | "updated"> {
  const existing = await prisma.giveawayEntry.findUnique({
    where: {
      campaignSlug_userId: { campaignSlug: ROBLOX_GIVEAWAY_SLUG, userId: args.userId },
    },
    select: { id: true },
  });
  await prisma.giveawayEntry.upsert({
    where: {
      campaignSlug_userId: { campaignSlug: ROBLOX_GIVEAWAY_SLUG, userId: args.userId },
    },
    create: {
      campaignSlug: ROBLOX_GIVEAWAY_SLUG,
      userId: args.userId,
      name: args.name,
      email: args.email,
      reason: args.reason,
    },
    update: {
      name: args.name,
      reason: args.reason,
    },
  });
  return existing ? "updated" : "created";
}

export async function enterGiveawayAction(
  _prev: GiveawayFormState,
  formData: FormData,
): Promise<GiveawayFormState> {
  if (!isGiveawayOpen()) return closedOrUpcomingError();

  const session = await auth();
  const reasonParsed = reasonSchema.safeParse(formData.get("reason"));
  if (!reasonParsed.success) {
    return { error: reasonParsed.error.issues[0]?.message ?? "Invalid reason" };
  }
  const ageConfirmed = formData.get("ageConfirmed") === "on";
  if (!ageConfirmed) {
    return { error: "Confirm you are 18 or older to enter." };
  }

  if (session?.user?.id && session.user.email) {
    const nameParsed = nameSchema.safeParse(formData.get("name") || session.user.name || "VaultQuest user");
    if (!nameParsed.success) return { error: "Enter your name" };
    const result = await upsertEntry({
      userId: session.user.id,
      name: nameParsed.data,
      email: session.user.email.toLowerCase(),
      reason: reasonParsed.data,
    });
    if (!session.user.name && nameParsed.data) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name: nameParsed.data, ageConfirmed: true },
      });
    } else {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { ageConfirmed: true },
      });
    }
    revalidatePath("/giveaway");
    await captureServerEvent(session.user.id, PH_EVENTS.giveaway_submit, {
      campaign_slug: ROBLOX_GIVEAWAY_SLUG,
      result,
    });
    return {
      ok: true,
      message:
        result === "created"
          ? "You're in. One base entry is recorded. Completed quests on /earn add extra entries."
          : "You're already in. We updated your note. Extra entries still come from completed quests.",
    };
  }

  const registration = await submitSignedOutGiveaway({
    campaignSlug: ROBLOX_GIVEAWAY_SLUG,
    formData,
    store: {
      async findUserIdByEmail(email) {
        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true },
        });
        return user?.id ?? null;
      },
      createUserWithEntry(args) {
        return prisma.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: {
              email: args.email,
              passwordHash: args.passwordHash,
              name: args.name,
              ageConfirmed: true,
            },
          });
          await tx.giveawayEntry.create({
            data: {
              campaignSlug: args.campaignSlug,
              userId: user.id,
              name: args.name,
              email: args.email,
              reason: args.reason,
            },
          });
          await tx.passwordResetToken.create({
            data: {
              userId: user.id,
              tokenHash: args.resetTokenHash,
              expiresAt: args.resetTokenExpiresAt,
            },
          });
          return { userId: user.id };
        });
      },
    },
  });

  if (registration.kind === "invalid") {
    return { error: registration.error };
  }
  if (registration.kind === "existing") {
    return {
      error: "An account with that email already exists. Sign in, then enter so we don't create a second account.",
    };
  }

  await sendPasswordResetEmail({
    to: registration.email,
    resetUrl: resetLinkForToken(registration.resetToken),
  });
  await captureServerEvent(registration.userId, PH_EVENTS.signup, { source: "giveaway" });
  await captureServerEvent(registration.userId, PH_EVENTS.giveaway_submit, {
    campaign_slug: ROBLOX_GIVEAWAY_SLUG,
    result: "created",
  });

  try {
    await signIn("credentials", {
      email: registration.email,
      password: registration.temporaryPassword,
      redirectTo: "/giveaway?entered=1",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Entry saved, but sign-in failed. Use Sign in, then come back to /giveaway." };
    }
    throw err;
  }

  return { ok: true };
}
