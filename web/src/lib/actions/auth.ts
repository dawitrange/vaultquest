"use server";

import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { z } from "zod";
import { cookies } from "next/headers";
import { signIn } from "@/auth";
import { authHintFromFormData, pathAfterSignup, pathFromAuthHint } from "@/lib/auth-redirect";
import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { createResetToken, hashResetToken, RESET_TOKEN_TTL_MS, resetLinkForToken } from "@/lib/password-reset";
import {
  FIRST_TOUCH_COOKIE,
  FIRST_TOUCH_MAX_AGE_SEC,
  hasUtm,
  mergeFirstTouch,
  serializeUtmCookie,
  utmFromCookieValue,
  utmFromFormData,
  type UtmTouch,
} from "@/lib/utm";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1).max(80).optional(),
  ageConfirmed: z
    .boolean()
    .refine((v) => v === true, { message: "You must confirm you meet the age requirement" }),
});

export type AuthFormState = { error?: string; ok?: boolean; message?: string };

export async function signupAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name") || undefined,
    ageConfirmed: formData.get("ageConfirmed") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with that email already exists" };

  const passwordHash = await hash(parsed.data.password, 12);
  const utm = await firstTouchUtmFromRequest(formData);
  await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: parsed.data.name,
      ageConfirmed: true,
      ...(hasUtm(utm) ? { utm } : {}),
    },
  });

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo: pathAfterSignup(),
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Account created but sign-in failed. Try logging in." };
    }
    throw err;
  }

  return { ok: true };
}

export async function loginAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Email and password required" };

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: pathFromAuthHint(authHintFromFormData(formData)),
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Invalid email or password" };
    }
    throw err;
  }

  return { ok: true };
}

const requestResetSchema = z.object({
  email: z.string().email(),
});

const GENERIC_RESET_MESSAGE =
  "If an account exists for that email, we sent a reset link. Check your inbox and spam folder.";

export async function requestPasswordResetAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = requestResetSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: "Enter a valid email address" };
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });
    const { token, tokenHash } = createResetToken();
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });
    await sendPasswordResetEmail({
      to: email,
      resetUrl: resetLinkForToken(token),
    });
  }

  return { ok: true, message: GENERIC_RESET_MESSAGE };
}

const resetPasswordSchema = z.object({
  token: z.string().min(16),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function resetPasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const tokenHash = hashResetToken(parsed.data.token);
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!record || record.expiresAt.getTime() < Date.now()) {
    if (record) {
      await prisma.passwordResetToken.delete({ where: { id: record.id } });
    }
    return { error: "This reset link is invalid or expired. Request a new one." };
  }

  const passwordHash = await hash(parsed.data.password, 12);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { userId: record.userId },
    }),
  ]);

  return { ok: true, message: "Password updated. You can sign in now." };
}

export async function rememberFirstTouchUtm(utm: UtmTouch): Promise<void> {
  if (!hasUtm(utm)) return;
  try {
    const jar = await cookies();
    if (jar.get(FIRST_TOUCH_COOKIE)?.value) return;
    jar.set(FIRST_TOUCH_COOKIE, serializeUtmCookie(utm), {
      path: "/",
      maxAge: FIRST_TOUCH_MAX_AGE_SEC,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  } catch {
    // Cookie jar unavailable (rare). Form hidden fields still persist UTMs on email signup.
  }
}

async function firstTouchUtmFromRequest(formData: FormData): Promise<UtmTouch> {
  const jar = await cookies();
  return mergeFirstTouch(utmFromFormData(formData), utmFromCookieValue(jar.get(FIRST_TOUCH_COOKIE)?.value));
}
