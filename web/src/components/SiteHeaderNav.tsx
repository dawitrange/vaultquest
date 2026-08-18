"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { loginPathForPage, signupPathForPage } from "@/lib/auth-redirect";
import { NAV } from "@/lib/site";

export function SiteHeaderNav({ email }: { email: string | null }) {
  const pathname = usePathname();
  const signInHref = loginPathForPage(pathname);
  const signUpHref = signupPathForPage(pathname);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const closeMenu = () => setOpen(false);
    window.addEventListener("vaultquest:header-navigation", closeMenu);
    return () =>
      window.removeEventListener("vaultquest:header-navigation", closeMenu);
  }, []);

  return (
    <>
      <nav className="hidden items-center gap-5 lg:flex" aria-label="Primary">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex min-h-11 items-center text-sm transition-colors ${active ? "text-[var(--vq-teal)]" : "text-[var(--vq-ink-muted)] hover:text-[var(--vq-ink)]"}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3">
        {email ? (
          <Link
            href="/account"
            className="hidden min-h-11 items-center text-sm text-[var(--vq-ink-muted)] hover:text-[var(--vq-teal)] sm:inline-flex"
          >
            Account
          </Link>
        ) : (
          <Link href={signInHref} className="hidden min-h-11 items-center text-sm text-[var(--vq-ink-muted)] hover:text-[var(--vq-ink)] sm:inline-flex">
            Sign in
          </Link>
        )}
        {!email ? (
          <Link
            href={signUpHref}
            className="hidden min-h-11 items-center rounded-md bg-[var(--vq-teal)] px-3.5 py-2 text-sm font-semibold text-[var(--vq-bg-deep)] transition hover:bg-[var(--vq-teal-dim)] hover:text-white sm:inline-flex"
          >
            Sign up
          </Link>
        ) : null}
        <button
          type="button"
          className="min-h-11 rounded-md border border-[var(--vq-border)] px-3 py-2 text-sm text-[var(--vq-ink)] focus-visible:shadow-[var(--vq-focus)] lg:hidden"
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
                  className="flex min-h-11 items-center rounded-md px-2 py-2 text-[var(--vq-ink-muted)] hover:bg-[var(--vq-surface)] hover:text-[var(--vq-ink)]"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={email ? "/account" : signInHref}
                className="flex min-h-11 items-center px-2 py-2 text-[var(--vq-ink-muted)]"
                onClick={() => setOpen(false)}
              >
                {email ? "Account" : "Sign in"}
              </Link>
            </li>
            {!email ? (
              <li>
                <Link
                  href={signUpHref}
                  className="mt-1 flex min-h-11 items-center justify-center rounded-md bg-[var(--vq-teal)] px-2 py-2 text-center font-semibold text-[var(--vq-bg-deep)]"
                  onClick={() => setOpen(false)}
                >
                  Sign up
                </Link>
              </li>
            ) : null}
          </ul>
        </nav>
      ) : null}
    </>
  );
}
