import type { Metadata } from "next";
import { auth } from "@/auth";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get help with VaultQuest accounts, rewards, and giveaways.",
};

export default async function ContactPage() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-xl px-4 py-14 sm:px-6">
      <h1 className="font-[family-name:var(--vq-font-display)] text-4xl font-bold tracking-tight">Contact</h1>
      <p className="mt-3 text-[var(--vq-ink-muted)]">
        Support for account, redeem, and giveaway questions. Prefer email at{" "}
        <a href="mailto:support@vaultquest.io" className="text-[var(--vq-teal)] hover:underline">
          support@vaultquest.io
        </a>
        . We will never ask for your Steam password.
      </p>
      <ContactForm
        defaultEmail={session?.user?.email ?? undefined}
        defaultName={session?.user?.name ?? undefined}
      />
    </div>
  );
}
