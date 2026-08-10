"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { sendContactEmail } from "@/lib/email";

export type ContactState = { error?: string; ok?: boolean; message?: string };

const schema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email(),
  message: z.string().min(10).max(5000),
});

export async function contactAction(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const session = await auth();
  const row = await prisma.contactMessage.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      message: parsed.data.message,
      userId: session?.user?.id ?? null,
    },
  });

  const mail = await sendContactEmail({
    id: row.id,
    name: parsed.data.name,
    email: parsed.data.email,
    message: parsed.data.message,
  });

  return {
    ok: true,
    message: mail.sent
      ? "Message sent. We’ll reply by email."
      : "Message saved. Email delivery isn’t configured yet (set RESEND_API_KEY + CONTACT_TO_EMAIL) — we’ll still see it in admin.",
  };
}
