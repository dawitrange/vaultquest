"use client";

import { useEffect, useState } from "react";

const STEPS = [
  {
    id: "earn",
    label: "1 · Earn",
    title: "Quest credited",
    detail: "+850 VP available after partner confirm",
  },
  {
    id: "redeem",
    label: "2 · Unlock",
    title: "Redeem Steam credit",
    detail: "Spend Vault points — we never ask for your Steam password",
  },
  {
    id: "steam",
    label: "3 · Steam",
    title: "Apply on Steam",
    detail: "Activate the code in Steam → Wallet funded",
  },
] as const;

export function HeroRedeemDemo() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setStep((s) => (s + 1) % STEPS.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, []);

  const current = STEPS[step];

  return (
    <div className="vq-demo" aria-label="Sample only. Not a real redemption.">
      <div className="vq-demo__chrome">
        <span className="vq-demo__dot" />
        <span className="vq-demo__dot" />
        <span className="vq-demo__dot" />
        <p className="vq-demo__url">Sample only. Not a real code.</p>
      </div>

      <div className="vq-demo__steps" role="tablist" aria-label="Demo steps">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={i === step}
            className={`vq-demo__step${i === step ? " is-active" : ""}`}
            onClick={() => setStep(i)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="vq-demo__stage" key={current.id}>
        {current.id === "earn" && (
          <div className="vq-demo__panel animate-vq-unlock">
            <p className="vq-demo__eyebrow">Earn</p>
            <p className="vq-demo__heading">Play & Earn · Mobile game</p>
            <p className="vq-demo__meta">Partner confirmed · hold cleared</p>
            <p className="vq-demo__vp">+850 VP</p>
            <div className="vq-demo__bar">
              <span>Available</span>
              <span className="font-[family-name:var(--vq-font-mono)] text-[var(--vq-teal)]">1,250 VP</span>
            </div>
          </div>
        )}

        {current.id === "redeem" && (
          <div className="vq-demo__panel animate-vq-unlock">
            <p className="vq-demo__eyebrow">Rewards</p>
            <p className="vq-demo__heading">$5 Steam credit</p>
            <p className="vq-demo__meta">Cost 500 VP. Sample unlock, not a real send.</p>
            <div className="vq-demo__cta-row">
              <span className="vq-demo__pill">Unlock</span>
              <span className="vq-demo__code">Sample</span>
            </div>
            <p className="vq-demo__hint">Example only. We do not show a real Steam code here.</p>
          </div>
        )}

        {current.id === "steam" && (
          <div className="vq-demo__panel vq-demo__panel--steam animate-vq-unlock">
            <p className="vq-demo__eyebrow vq-demo__eyebrow--brass">Steam</p>
            <p className="vq-demo__heading">Activate a Product Code</p>
            <div className="vq-demo__steam-field">Sample. Not a real code.</div>
            <p className="vq-demo__steam-ok">No wallet was credited. This is a walkthrough.</p>
            <p className="vq-demo__hint">A real code would go to your VaultQuest account after unlock.</p>
          </div>
        )}
      </div>

      <p className="vq-demo__caption">
        <span className="text-[var(--vq-ink)]">{current.title}</span>
        <span className="mx-2 text-[var(--vq-ink-faint)]">·</span>
        {current.detail}
      </p>
    </div>
  );
}
