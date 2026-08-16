import Link from "next/link";
import { auth } from "@/auth";
import { SiteHeaderNav } from "@/components/SiteHeaderNav";
import { SITE } from "@/lib/site";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="relative sticky top-0 z-40 border-b border-[var(--vq-border)]/80 bg-[var(--vq-bg-deep)]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label={`${SITE.name} — home`}>
          <span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[var(--vq-teal)]/50 bg-[var(--vq-bg-deep)] sm:h-9 sm:w-9"
            aria-hidden="true"
            title="Vault wheel"
          >
            <svg width="22" height="22" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="h-[22px] w-[22px] sm:h-[24px] sm:w-[24px]">
              <circle cx="24" cy="24" r="19.5" fill="none" stroke="#2dd4bf" strokeWidth="2.2" />
              <circle cx="24" cy="24" r="14.5" fill="none" stroke="#2a3642" strokeWidth="0.7" opacity="0.5" />
              <g transform="rotate(135 24 24)">
                <rect x="22.2" y="11.5" width="3.6" height="18" rx="1.8" fill="#c4a574" />
              </g>
              <g transform="rotate(255 24 24)">
                <rect x="22.2" y="11.5" width="3.6" height="13" rx="1.8" fill="#c4a574" opacity="0.98" />
              </g>
              <g transform="rotate(15 24 24)">
                <rect x="22.2" y="11.5" width="3.6" height="13" rx="1.8" fill="#c4a574" opacity="0.98" />
              </g>
              <circle cx="24" cy="24" r="5.2" fill="#0b1014" stroke="#c4a574" strokeWidth="0.9" />
              <circle cx="24" cy="24" r="1.6" fill="#c4a574" />
            </svg>
          </span>
          <span className="font-[family-name:var(--vq-font-display)] text-xl font-bold tracking-tight text-[var(--vq-ink)] sm:text-2xl">
            {SITE.name}
          </span>
        </Link>
        <SiteHeaderNav email={session?.user?.email ?? null} />
      </div>
    </header>
  );
}
