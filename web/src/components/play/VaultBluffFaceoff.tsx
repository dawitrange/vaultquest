"use client";

import Link from "next/link";
import { useState, type MouseEventHandler } from "react";
import { PERSONAS } from "@/lib/vault-bluff/personas";
import type { SafeRoundDto } from "@/lib/vault-bluff/types";
import type { ApiResult, ClientCommand } from "./VaultBluffGame";

type FaceoffProps = {
  game: ApiResult;
  pending: boolean;
  error: string | null;
  retryAvailable: boolean;
  revealReady: boolean;
  onAction: (command: ClientCommand) => void;
  onRetry: () => void;
  onRematch: () => void;
  onNewBot: () => void;
  onContinue: MouseEventHandler<HTMLButtonElement>;
  onContinuePointerDown: () => void;
  onContinuePointerReset: () => void;
};

export function VaultBluffFaceoffLoading({
  message,
  retrying = false,
  onRetry = null,
}: {
  message: string;
  retrying?: boolean;
  onRetry?: (() => void) | null;
}) {
  return (
    <main className="vq-faceoff vq-faceoff--loading">
      <p role="status">{message}</p>
      {onRetry ? (
        <button type="button" disabled={retrying} onClick={onRetry}>
          {retrying ? "Retrying..." : "Retry"}
        </button>
      ) : null}
    </main>
  );
}

export function VaultBluffFaceoff({
  game,
  pending,
  error,
  retryAvailable,
  revealReady,
  onAction,
  onRetry,
  onRematch,
  onNewBot,
  onContinue,
  onContinuePointerDown,
  onContinuePointerReset,
}: FaceoffProps) {
  const [hintVisible, setHintVisible] = useState(true);
  const persona = PERSONAS[game.session.persona];
  const round = game.session.currentRound;

  return (
    <main className="vq-faceoff" aria-labelledby="faceoff-opponent">
      <div className="vq-faceoff__header-controls">
        <button
          type="button"
          aria-label="How to play"
          aria-pressed={hintVisible}
          onClick={() => setHintVisible(true)}
          className="vq-faceoff__help-icon"
        >
          ?
        </button>
        <span
          role="img"
          aria-label="Settings are not part of this QA cycle"
          className="vq-faceoff__gear-icon"
        >
          <GearIcon />
        </span>
      </div>

      <section className="vq-faceoff__table" aria-label="Vault Bluff table">
        <BotMark />
        <h1 id="faceoff-opponent" className="vq-faceoff__opponent-name">
          {persona.name}
        </h1>
        <p className="vq-faceoff__bot-label">(bot)</p>

        {round.phase === "CHOOSER_DECISION" ? (
          <DecisionTable
            round={round}
            personaName={persona.name}
            pending={pending}
            hintVisible={hintVisible}
            humanScore={game.session.humanScore}
            botScore={game.session.botScore}
            onAction={onAction}
            onSkip={() => setHintVisible(false)}
          />
        ) : null}

        {round.phase === "ROUND_REVEAL" ? (
          <RevealTable
            round={round}
            personaName={persona.name}
            pending={pending}
            revealReady={revealReady}
            humanScore={game.session.humanScore}
            botScore={game.session.botScore}
            onContinue={onContinue}
            onContinuePointerDown={onContinuePointerDown}
            onContinuePointerReset={onContinuePointerReset}
          />
        ) : null}

        {round.phase === "MATCH_COMPLETE" ? (
          <ResultTable
            round={round}
            pending={pending}
            humanScore={game.session.humanScore}
            botScore={game.session.botScore}
            onRematch={onRematch}
            onNewBot={onNewBot}
          />
        ) : null}

        {error ? (
          <section role="alert" className="vq-faceoff__error">
            <p>{error}</p>
            {retryAvailable ? (
              <button type="button" disabled={pending} onClick={onRetry}>
                {pending ? "Retrying..." : "Retry"}
              </button>
            ) : null}
          </section>
        ) : null}
      </section>
    </main>
  );
}

function DecisionTable({
  round,
  personaName,
  pending,
  hintVisible,
  humanScore,
  botScore,
  onAction,
  onSkip,
}: {
  round: SafeRoundDto;
  personaName: string;
  pending: boolean;
  hintVisible: boolean;
  humanScore: number;
  botScore: number;
  onAction: (command: ClientCommand) => void;
  onSkip: () => void;
}) {
  return (
    <>
      {hintVisible ? (
        <div id="faceoff-hint" className="vq-faceoff__hint">
          <p>Take the shiny case.</p>
          <button type="button" onClick={onSkip}>
            Skip
          </button>
        </div>
      ) : null}
      <div className="vq-faceoff__arena">
        <div className="vq-faceoff__cases" aria-label="Two sealed cases">
          <CaseCard label="A · Yours" tone="human" />
          <CaseCard label={`B · ${personaName}`} tone="bot" />
        </div>
      </div>
      <div className="vq-faceoff__choices" aria-label="Choose a case">
        <button
          type="button"
          disabled={pending}
          onClick={() => onAction({ kind: "CHOOSE_CASE", choice: "KEEP" })}
          className="vq-faceoff__choice vq-faceoff__choice--keep"
        >
          Keep
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => onAction({ kind: "CHOOSE_CASE", choice: "TAKE" })}
          className="vq-faceoff__choice vq-faceoff__choice--take"
        >
          Take
        </button>
      </div>
      <Progress
        round={round}
        humanScore={humanScore}
        botScore={botScore}
      />
    </>
  );
}

function RevealTable({
  round,
  personaName,
  pending,
  revealReady,
  humanScore,
  botScore,
  onContinue,
  onContinuePointerDown,
  onContinuePointerReset,
}: {
  round: SafeRoundDto;
  personaName: string;
  pending: boolean;
  revealReady: boolean;
  humanScore: number;
  botScore: number;
  onContinue: MouseEventHandler<HTMLButtonElement>;
  onContinuePointerDown: () => void;
  onContinuePointerReset: () => void;
}) {
  const lines = revealLines(round);
  return (
    <>
      <div className="vq-faceoff__arena vq-faceoff__arena--reveal">
        <div className="vq-faceoff__cases vq-faceoff__cases--reveal">
          <CaseCard
            label="A · Yours"
            tone="human"
            status={round.keyCase === "CASE_A" ? "Key" : "Sealed"}
          />
          <CaseCard
            label={`B · ${personaName}`}
            tone="bot"
            status={round.keyCase === "CASE_B" ? "Key" : "Sealed"}
          />
        </div>
      </div>
      <dl className="vq-faceoff__reveal">
        {lines.map((line) => (
          <div key={line.label}>
            <dt>{line.label}</dt>
            <dd>{line.value}</dd>
          </div>
        ))}
      </dl>
      <button
        type="button"
        disabled={pending || !revealReady}
        onPointerDown={onContinuePointerDown}
        onPointerCancel={onContinuePointerReset}
        onPointerLeave={onContinuePointerReset}
        onClick={onContinue}
        className="vq-faceoff__continue"
      >
        Continue
      </button>
      <Progress
        round={round}
        humanScore={humanScore}
        botScore={botScore}
      />
    </>
  );
}

function ResultTable({
  round,
  pending,
  humanScore,
  botScore,
  onRematch,
  onNewBot,
}: {
  round: SafeRoundDto;
  pending: boolean;
  humanScore: number;
  botScore: number;
  onRematch: () => void;
  onNewBot: () => void;
}) {
  return (
    <>
      <Progress
        round={round}
        humanScore={humanScore}
        botScore={botScore}
        result
      />
      <div className="vq-faceoff__result-actions">
        <button type="button" disabled={pending} onClick={onRematch}>
          Rematch
        </button>
        <button type="button" disabled={pending} onClick={onNewBot}>
          New BOT
        </button>
        <Link href="/earn">Explore</Link>
        <Link href="/play">Done</Link>
      </div>
    </>
  );
}

function Progress({
  round,
  humanScore,
  botScore,
  result = false,
}: {
  round: SafeRoundDto;
  humanScore: number;
  botScore: number;
  result?: boolean;
}) {
  return (
    <div
      className="vq-faceoff__progress"
      data-result={result}
      role="progressbar"
      aria-label={`Round ${round.number} of 4`}
      aria-valuemin={1}
      aria-valuemax={4}
      aria-valuenow={round.number}
    >
      <div className="vq-faceoff__pips" aria-hidden="true">
        {[1, 2, 3, 4].map((roundNumber) => (
          <span
            key={roundNumber}
            data-state={
              round.phase === "MATCH_COMPLETE" || roundNumber < round.number
                ? "done"
                : roundNumber === round.number
                  ? "current"
                  : "remaining"
            }
          />
        ))}
        <small className="vq-faceoff__round-count">{round.number}/4</small>
      </div>
      <p>
        {humanScore} - {botScore}
      </p>
    </div>
  );
}

function CaseCard({
  label,
  tone,
  status = "Sealed",
}: {
  label: string;
  tone: "human" | "bot";
  status?: "Sealed" | "Key";
}) {
  return (
    <article className="vq-faceoff__case" data-tone={tone}>
      <p>{label}</p>
      <span aria-hidden="true" />
      <strong>{status}</strong>
    </article>
  );
}

function revealLines(round: SafeRoundDto) {
  const response = round.responses.at(-1);
  const signal =
    round.humanRole === "CHOOSER" && response
      ? response.recommendation === "TAKE"
        ? "Take the case"
        : "Keep the case"
      : round.choice === "TAKE"
        ? "Take the case"
        : "Keep the case";
  const read =
    round.choice === "TAKE"
      ? `You took ${round.botCase === "CASE_B" ? "B" : "A"}`
      : `You kept ${round.humanCase === "CASE_A" ? "A" : "B"}`;
  const outcome = round.winner === "HUMAN" ? "You win" : "Bot wins";

  return [
    { label: "Signal", value: signal },
    { label: "Read", value: read },
    { label: "Outcome", value: outcome },
  ];
}

function BotMark() {
  return (
    <span className="vq-faceoff__bot-mark" aria-hidden="true">
      <span />
    </span>
  );
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        d="M12 8.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2Zm7 4.8 1.4 1.1-1.7 3-1.7-.7a8 8 0 0 1-2 1.2l-.3 1.8h-3.4l-.3-1.8a8 8 0 0 1-2-1.2l-1.7.7-1.7-3L7 13.2a8 8 0 0 1 0-2.4L5.6 9.7l1.7-3 1.7.7a8 8 0 0 1 2-1.2l.3-1.8h3.4l.3 1.8a8 8 0 0 1 2 1.2l1.7-.7 1.7 3-1.4 1.1a8 8 0 0 1 0 2.4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
