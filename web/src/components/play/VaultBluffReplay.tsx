import Link from "next/link";
import {
  type PublicPersonaCueCode,
  type PublicReplayFrame,
  type PublicResponseDurationBucket,
  type PublicRevealedOutcome,
  type PublicVaultBluffReplay,
} from "@/lib/vault-bluff/public-replay";
import { PERSONAS } from "@/lib/vault-bluff/personas";
import type {
  Confidence,
  Recommendation,
} from "@/lib/vault-bluff/types";
import { VaultBluffReplayShare } from "./VaultBluffReplayShare";

const PERSONA_CUE_COPY: Record<PublicPersonaCueCode, string> = {
  MEASURED_READ: "Measured read",
  BOLD_READ: "Bold read",
  CAUTIOUS_READ: "Cautious read",
  UNPREDICTABLE_READ: "Unpredictable read",
};

const CONFIDENCE_COPY: Record<Confidence, string> = {
  CERTAIN: "Certain",
  UNSURE: "Unsure",
  GUESSING: "Guessing",
};

const RECOMMENDATION_COPY: Record<Recommendation, string> = {
  KEEP: "Keep",
  TAKE: "Take",
};

const DURATION_COPY: Record<PublicResponseDurationBucket, string> = {
  BRIEF: "Brief",
  STEADY: "Steady",
  DELIBERATE: "Deliberate",
};

const OUTCOME_COPY: Record<PublicRevealedOutcome, string> = {
  PLAYER_KEEP_WIN: "Player kept their case and won the point.",
  PLAYER_KEEP_LOSS: "BOT won the point after the player kept.",
  PLAYER_TAKE_WIN: "Player took the other case and won the point.",
  PLAYER_TAKE_LOSS: "BOT won the point after the player took.",
  BOT_KEEP_WIN: "BOT kept its case and won the point.",
  BOT_KEEP_LOSS: "Player won the point after BOT kept.",
  BOT_TAKE_WIN: "BOT took the other case and won the point.",
  BOT_TAKE_LOSS: "Player won the point after BOT took.",
};

const REMATCH_COPY: Record<PublicReplayFrame["rematchState"], string> = {
  NEW_SESSION_REQUIRED:
    "Rematch opens your own game session. This archived match never changes.",
};

function signalOwner(roundIndex: number): "Player" | "BOT" {
  return roundIndex % 2 === 0 ? "Player" : "BOT";
}

function ReplayRound({
  frame,
  index,
}: {
  frame: PublicReplayFrame;
  index: number;
}) {
  return (
    <li className="rounded-[10px] border border-[var(--vq-border)] bg-[var(--vq-surface)] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-[family-name:var(--vq-font-mono)] text-xs uppercase tracking-wider text-[var(--vq-teal)]">
            Round {index + 1} · {frame.roundPhase === "MATCH_COMPLETE" ? "Final" : "Revealed"}
          </p>
          <h2 className="mt-1 font-[family-name:var(--vq-font-display)] text-xl font-semibold">
            {OUTCOME_COPY[frame.revealedOutcome]}
          </h2>
        </div>
        <p className="font-[family-name:var(--vq-font-mono)] text-sm text-[var(--vq-ink-muted)]">
          Player {index + 1 - frame.botScore} · BOT {frame.botScore}
        </p>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-xs uppercase tracking-wider text-[var(--vq-ink-faint)]">
            {signalOwner(index)} confidence
          </dt>
          <dd className="mt-1 font-semibold">{CONFIDENCE_COPY[frame.confidence]}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-[var(--vq-ink-faint)]">
            Recommendation
          </dt>
          <dd className="mt-1 font-semibold">
            {RECOMMENDATION_COPY[frame.recommendation]}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-[var(--vq-ink-faint)]">
            Response pace
          </dt>
          <dd className="mt-1 font-semibold">
            {DURATION_COPY[frame.responseDurationBucket]}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-[var(--vq-ink-faint)]">
            Public contradictions
          </dt>
          <dd className="mt-1 font-semibold">{frame.publicContradictionCount}</dd>
        </div>
      </dl>

      <p className="mt-4 text-sm text-[var(--vq-ink-muted)]">
        Persona cue: {PERSONA_CUE_COPY[frame.personaCueCode]}
      </p>
    </li>
  );
}

export function VaultBluffReplay({
  replay,
  sessionId,
}: {
  replay: PublicVaultBluffReplay;
  sessionId: string;
}) {
  const finalFrame = replay.at(-1);
  if (!finalFrame) return null;

  const persona = PERSONAS[finalFrame.personaId];
  const playerScore = replay.length - finalFrame.botScore;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="rounded-[12px] border border-[var(--vq-border-strong)] bg-[var(--vq-bg-raised)] p-6 sm:p-8">
        <p className="font-[family-name:var(--vq-font-mono)] text-xs uppercase tracking-wider text-[var(--vq-teal)]">
          Public replay · finished match
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="font-[family-name:var(--vq-font-display)] text-4xl font-bold tracking-tight">
              Vault Bluff
            </h1>
            <p className="mt-2 text-lg text-[var(--vq-ink-muted)]">
              {persona.name} <span className="text-[var(--vq-teal)]">(bot)</span>
            </p>
          </div>
          <p
            className="rounded-md border border-[var(--vq-border)] bg-[var(--vq-bg-sunken)] px-4 py-3 font-[family-name:var(--vq-font-mono)] text-lg"
            aria-label={`Final score, player ${playerScore}, bot ${finalFrame.botScore}`}
          >
            Player {playerScore} · BOT {finalFrame.botScore}
          </p>
        </div>
        <p className="mt-5 max-w-2xl text-sm text-[var(--vq-ink-muted)]">
          This archived view uses the match’s finished public signals. It contains no live decisions, private inspection, or hidden case data.
        </p>
      </header>

      <ol className="mt-6 grid gap-4" aria-label="Replay rounds">
        {replay.map((frame, index) => (
          <ReplayRound
            key={`${frame.roundPhase}-${index}`}
            frame={frame}
            index={index}
          />
        ))}
      </ol>

      <section className="mt-6 rounded-[12px] border border-[var(--vq-border-strong)] bg-[var(--vq-bg-raised)] p-6">
        <p className="text-sm text-[var(--vq-ink-muted)]">
          {REMATCH_COPY[finalFrame.rematchState]}
        </p>
        <VaultBluffReplayShare sessionId={sessionId} className="mt-5" />
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Link
            href="/play/vault-bluff"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--vq-teal)] px-4 py-2 text-sm font-semibold text-[var(--vq-bg-deep)]"
          >
            Rematch
          </Link>
          <Link
            href="/earn"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--vq-border-strong)] px-4 py-2 text-sm font-semibold hover:border-[var(--vq-teal)] hover:text-[var(--vq-teal)]"
          >
            Explore
          </Link>
          <Link
            href="/play"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--vq-border-strong)] px-4 py-2 text-sm font-semibold hover:border-[var(--vq-warn)]"
          >
            Done
          </Link>
        </div>
        <p className="mt-5 text-xs text-[var(--vq-ink-faint)]">
          Watching or sharing a replay adds no VP or rewards.
        </p>
      </section>
    </main>
  );
}
