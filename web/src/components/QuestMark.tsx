import type { Quest } from "@/lib/affiliates";

/** Abstract vault-chrome marks. Not game art, not partner logos. */
export function QuestMark({ quest }: { quest: Quest }) {
  const kind = quest.pinSlug ? "third" : quest.category;
  return (
    <div
      className="vq-quest-mark"
      data-kind={kind}
      aria-hidden
    >
      {kind === "offerwall_primary" ? (
        <svg viewBox="0 0 48 48" className="h-full w-full">
          <rect x="8" y="10" width="32" height="28" rx="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M16 10v28M24 10v28M32 10v28M8 20h32M8 28h32" stroke="currentColor" strokeWidth="1.1" opacity="0.55" />
        </svg>
      ) : null}
      {kind === "cpa_signup" ? (
        <svg viewBox="0 0 48 48" className="h-full w-full">
          <circle cx="20" cy="24" r="8" fill="none" stroke="currentColor" strokeWidth="1.7" />
          <path d="M27 24h13l-4-4M40 24l-4 4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      ) : null}
      {kind === "survey_wall" ? (
        <svg viewBox="0 0 48 48" className="h-full w-full">
          <path d="M12 16h24M12 24h18M12 32h21" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <circle cx="36" cy="24" r="2.2" fill="currentColor" />
        </svg>
      ) : null}
      {kind === "cpe_play" ? (
        <svg viewBox="0 0 48 48" className="h-full w-full">
          <rect x="10" y="16" width="28" height="16" rx="8" fill="none" stroke="currentColor" strokeWidth="1.7" />
          <path d="M18 24h4M20 22v4M30 22.5v.2M33 25.5v.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      ) : null}
      {kind === "third" ? (
        <svg viewBox="0 0 48 48" className="h-full w-full">
          <path d="M14 34V14h12M34 14v20H22" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M22 18h10v10M32 18l-9 9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      ) : null}
    </div>
  );
}
