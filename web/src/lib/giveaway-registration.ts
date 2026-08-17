import { randomBytes } from "node:crypto";
import { hash } from "bcryptjs";
import { z } from "zod";
import { createResetToken, RESET_TOKEN_TTL_MS } from "@/lib/password-reset";

export type GiveawayRegistrationStore = {
  findUserIdByEmail(email: string): Promise<string | null>;
  createUserWithEntry(args: {
    campaignSlug: string;
    email: string;
    name: string;
    reason: string;
    passwordHash: string;
    resetTokenHash: string;
    resetTokenExpiresAt: Date;
  }): Promise<{ userId: string }>;
};

type GiveawayRegistrationResult =
  | { kind: "invalid"; error: string }
  | { kind: "existing" }
  | {
      kind: "created";
      userId: string;
      email: string;
      temporaryPassword: string;
      resetToken: string;
    };

const registrationSchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(80),
  email: z.string().trim().email("Enter a valid email address"),
  reason: z.string().trim().min(8, "Write a short reason (at least 8 characters)").max(500),
  ageConfirmed: z.literal(true, { error: "Confirm you are 18 or older to enter." }),
});

export async function submitSignedOutGiveaway(args: {
  store: GiveawayRegistrationStore;
  campaignSlug: string;
  formData: FormData;
  now?: number;
}): Promise<GiveawayRegistrationResult> {
  const parsed = registrationSchema.safeParse({
    name: args.formData.get("name"),
    email: args.formData.get("email"),
    reason: args.formData.get("reason"),
    ageConfirmed: args.formData.get("ageConfirmed") === "on",
  });
  if (!parsed.success) {
    return {
      kind: "invalid",
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const email = parsed.data.email.toLowerCase();
  const existingUserId = await args.store.findUserIdByEmail(email);
  if (existingUserId) return { kind: "existing" };

  const temporaryPassword = randomBytes(32).toString("base64url");
  const passwordHash = await hash(temporaryPassword, 12);
  const { token: resetToken, tokenHash: resetTokenHash } = createResetToken();
  const resetTokenExpiresAt = new Date((args.now ?? Date.now()) + RESET_TOKEN_TTL_MS);
  const { userId } = await args.store.createUserWithEntry({
    campaignSlug: args.campaignSlug,
    email,
    name: parsed.data.name,
    reason: parsed.data.reason,
    passwordHash,
    resetTokenHash,
    resetTokenExpiresAt,
  });

  return {
    kind: "created",
    userId,
    email,
    temporaryPassword,
    resetToken,
  };
}
