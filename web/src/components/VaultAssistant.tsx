"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type Msg = { role: "user" | "assistant"; content: string };

const STARTERS = [
  "How does Vault Points earning work?",
  "How long until my points are available?",
  "What can I redeem for Steam?",
];

export function VaultAssistant() {
  const pathname = usePathname();
  const hiddenForVaultBluff = pathname === "/play/vault-bluff";
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hey — I'm Vault Assistant. Ask me how earning, holds, and Steam redemptions work. No generators — just real quests with transparent rewards.",
    },
  ]);
  const [busy, setBusy] = useState(false);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (hiddenForVaultBluff) return;
    fetch("/api/chat")
      .then((r) => r.json())
      .then((j) => setConfigured(Boolean(j.configured)))
      .catch(() => setConfigured(false));
  }, [hiddenForVaultBluff]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, busy]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    if (configured === false) return;
    setInput("");
    const next: Msg[] = [...msgs, { role: "user", content }];
    setMsgs(next);
    setBusy(true);

    // placeholder for streaming assistant
    setMsgs((m) => [...m, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
          stream: true,
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => null);
        const err = j?.error || `Error ${res.status}`;
        setMsgs((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: `⚠️ ${err}` };
          return copy;
        });
        return;
      }

      if (!res.body) {
        const j = await res.json();
        setMsgs((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: j.content || "(no reply)" };
          return copy;
        });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        buf += chunk;
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const data = trimmed.slice(5).trim();
          if (data === "[DONE]") break;
          try {
            const json = JSON.parse(data);
            const delta: string =
              json?.choices?.[0]?.delta?.content ?? json?.choices?.[0]?.message?.content ?? "";
            if (delta) {
              // eslint-disable-next-line react-hooks/immutability -- acc is a local streaming buffer, not React state
              acc += delta;
              setMsgs((m) => {
                const copy = [...m];
                copy[copy.length - 1] = { role: "assistant", content: acc };
                return copy;
              });
            }
          } catch {
            // ignore keepalive
          }
        }
      }
      if (!acc) {
        setMsgs((m) => {
          const copy = [...m];
          if (!copy[copy.length - 1]?.content) copy[copy.length - 1] = { role: "assistant", content: "(no reply — try again)" };
          return copy;
        });
      }
    } catch {
      setMsgs((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content: `⚠️ Network error — try again.` };
        return copy;
      });
    } finally {
      setBusy(false);
    }
  }

  // Never surface a broken/greyed assistant (or internal setup instructions) to
  // end users. Only render once we've confirmed the server has an AI key
  // (`configured === true`); while checking (`null`) or unconfigured (`false`)
  // the launcher stays hidden.
  if (hiddenForVaultBluff || configured !== true) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open Vault Assistant"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-[var(--vq-border-strong)] bg-[var(--vq-teal)] text-[var(--vq-bg-deep)] shadow-[0_10px_30px_rgba(0,0,0,0.45),0_0_0_8px_var(--vq-teal-glow)] transition hover:brightness-110 active:scale-95"
      >
        <span className="text-[1.35rem] leading-none">◈</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex h-[min(520px,calc(100dvh-32px))] w-[min(380px,calc(100vw-24px))] flex-col overflow-hidden rounded-2xl border border-[var(--vq-border)] bg-[var(--vq-bg-raised)] shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--vq-border)] bg-[var(--vq-bg-sunken)] px-4 py-3">
        <div className="min-w-0">
          <p className="font-[family-name:var(--vq-font-display)] text-sm font-bold tracking-tight">Vault Assistant</p>
          <p className="text-xs text-[var(--vq-ink-muted)]">Powered by OpenRouter • Transparent answers</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="grid h-8 w-8 place-items-center rounded-full border border-[var(--vq-border)] bg-[var(--vq-surface)] text-sm text-[var(--vq-ink-muted)] hover:text-[var(--vq-ink)]"
        >
          ✕
        </button>
      </div>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
              m.role === "user"
                ? "ml-auto bg-[var(--vq-teal)] text-[var(--vq-bg-deep)]"
                : "border border-[var(--vq-border)] bg-[var(--vq-surface)] text-[var(--vq-ink)]"
            }`}
          >
            {m.content ? (
              <span className="whitespace-pre-wrap break-words">{m.content}</span>
            ) : (
              <span className="inline-flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--vq-ink-faint)] [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--vq-ink-faint)] [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--vq-ink-faint)] [animation-delay:300ms]" />
              </span>
            )}
          </div>
        ))}
      </div>

      {msgs.length <= 2 && (
        <div className="flex flex-wrap gap-1.5 px-3 pb-2">
          {STARTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              disabled={busy}
              className="rounded-full border border-[var(--vq-border)] bg-[var(--vq-bg-sunken)] px-2.5 py-1 text-xs text-[var(--vq-ink-muted)] hover:border-[var(--vq-teal)]/40 hover:text-[var(--vq-ink)] disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex items-center gap-2 border-t border-[var(--vq-border)] bg-[var(--vq-bg-sunken)] p-2.5"
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about quests, VP, redemptions…"
          disabled={busy}
          maxLength={3000}
          className="min-w-0 flex-1 rounded-full border border-[var(--vq-border)] bg-[var(--vq-bg)] px-4 py-2.5 text-sm text-[var(--vq-ink)] placeholder:text-[var(--vq-ink-faint)] focus:border-[var(--vq-teal)] focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--vq-teal)] text-[var(--vq-bg-deep)] transition hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100"
          aria-label="Send"
        >
          ↑
        </button>
      </form>
    </div>
  );
}
