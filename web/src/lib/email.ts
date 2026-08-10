import { Resend } from "resend";

export async function sendContactEmail(opts: {
  name: string;
  email: string;
  message: string;
  id: string;
}) {
  const to = process.env.CONTACT_TO_EMAIL;
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL ?? "Vaultquest <onboarding@resend.dev>";

  if (!apiKey || !to) {
    console.info("[contact:email-skipped]", {
      reason: !apiKey ? "missing RESEND_API_KEY" : "missing CONTACT_TO_EMAIL",
      id: opts.id,
      from: opts.email,
    });
    return { sent: false as const, stored: true as const };
  }

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from,
    to,
    replyTo: opts.email,
    subject: `[Vaultquest Contact] ${opts.name}`,
    text: `From: ${opts.name} <${opts.email}>\nTicket: ${opts.id}\n\n${opts.message}`,
  });

  return { sent: true as const, stored: true as const };
}

export async function sendCreditEmail(opts: {
  to: string;
  vp: number;
  note?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL ?? "Vaultquest <onboarding@resend.dev>";

  if (!apiKey) {
    console.info("[credit:email-skipped]", {
      reason: "missing RESEND_API_KEY",
      to: opts.to,
      vp: opts.vp,
    });
    return { sent: false as const, reason: "missing RESEND_API_KEY" as const };
  }

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from,
    to: opts.to,
    subject: `You earned ${opts.vp} Vault Points`,
    text: `You were credited ${opts.vp} VP${opts.note ? ` — ${opts.note}` : ""}.\n\nCheck your balance at Vaultquest → Rewards.`,
  });

  return { sent: true as const };
}

export async function sendRedemptionEmail(opts: {
  to: string;
  label: string;
  costVp: number;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL ?? "Vaultquest <onboarding@resend.dev>";

  if (!apiKey) {
    console.info("[redemption:email-skipped]", {
      reason: "missing RESEND_API_KEY",
      to: opts.to,
      label: opts.label,
      costVp: opts.costVp,
    });
    return { sent: false as const, reason: "missing RESEND_API_KEY" as const };
  }

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from,
    to: opts.to,
    subject: `Redemption requested: ${opts.label}`,
    text: `Your redemption for "${opts.label}" (${opts.costVp} VP) is being processed.\n\nWe'll update you when it's fulfilled. — Vaultquest`,
  });

  return { sent: true as const };
}
