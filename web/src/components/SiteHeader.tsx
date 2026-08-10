import Link from "next/link";
import { auth } from "@/auth";
import { requireAdmin } from "@/lib/admin";
import { SiteHeaderNav } from "@/components/SiteHeaderNav";
import { SITE } from "@/lib/site";

export async function SiteHeader() {
  const session = await auth();
  const admin = session?.user?.id ? await requireAdmin() : null;

  return (
    <header className="relative sticky top-0 z-40 border-b border-[var(--vq-border)]/80 bg-[var(--vq-bg-deep)]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="font-[family-name:var(--vq-font-display)] text-xl font-bold tracking-tight text-[var(--vq-ink)] sm:text-2xl"
        >
          {SITE.name}
        </Link>
        <SiteHeaderNav email={session?.user?.email ?? null} isAdmin={Boolean(admin)} />
      </div>
    </header>
  );
}
