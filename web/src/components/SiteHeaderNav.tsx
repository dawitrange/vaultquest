"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { loginPathForPage } from "@/lib/auth-redirect";
import { NAV } from "@/lib/site";

export function SiteHeaderNav({ email, isAdmin }: { email: string | null; isAdmin?: boolean }) {
  const pathname = usePathname();
  const signInHref = loginPathForPage(pathname);
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm transition-colors ${active ? "text-[var(--vq-teal)]" : "text-[var(--vq-ink-muted)] hover:text-[var(--vq-ink)]"}`}
            >
              {item.label}
            </Link>
          );
        })}
        {isAdmin ? (
          <Link
            href="/admin"
            className={`text-sm transition-colors ${pathname === "/admin" ? "text-[var(--vq-teal)]" : "text-[var(--vq-brass)] hover:text-[var(--vq-ink)]"}`}
          >
            Admin
          </Link>
        ) : null}
      </nav>

      <div className="flex items-center gap-3">
        {email ? (
          <Link
            href="/account"
            className="hidden max-w-[10rem] truncate text-sm text-[var(--vq-ink-muted)] hover:text-[var(--vq-teal)] sm:inline"
          >
            {email}
          </Link>
        ) : (
          <Link href={signInHref} className="hidden text-sm text-[var(--vq-ink-muted)] hover:text-[var(--vq-ink)] sm:inline">
            Sign in
          </Link>
        )}
        <Link
          href={email ? "/earn" : "/signup"}
          className="hidden rounded-md bg-[var(--vq-teal)] px-3.5 py-2 text-sm font-semibold text-[var(--vq-bg-deep)] transition hover:bg-[var(--vq-teal-dim)] hover:text-white sm:inline-flex"
        >
          {email ? "See quests" : "Sign up"}
        </Link>
        <button
          type="button"
          className="rounded-md border border-[var(--vq-border)] px-3 py-2 text-sm text-[var(--vq-ink)] focus-visible:shadow-[var(--vq-focus)] lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          className="absolute left-0 right-0 top-full border-t border-[var(--vq-border)] bg-[var(--vq-bg-deep)] px-4 py-3 lg:hidden"
          aria-label="Mobile"
        >
          <ul className="flex flex-col gap-2">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-md px-2 py-2 text-[var(--vq-ink-muted)] hover:bg-[var(--vq-surface)] hover:text-[var(--vq-ink)]"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {isAdmin ? (
              <li>
                <Link href="/admin" className="block px-2 py-2 text-[var(--vq-brass)]" onClick={() => setOpen(false)}>
                  Admin
                </Link>
              </li>
            ) : null}
            <li>
              <Link
                href={email ? "/account" : signInHref}
                className="block px-2 py-2 text-[var(--vq-ink-muted)]"
                onClick={() => setOpen(false)}
              >
                {email ? "Account" : "Sign in"}
              </Link>
            </li>
            <li>
              <Link
                href={email ? "/earn" : "/signup"}
                className="mt-1 block rounded-md bg-[var(--vq-teal)] px-2 py-2 text-center font-semibold text-[var(--vq-bg-deep)]"
                onClick={() => setOpen(false)}
              >
                {email ? "See quests" : "Sign up"}
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </>
  );
}
