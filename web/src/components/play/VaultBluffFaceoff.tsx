"use client";

import { useState } from "react";
import { PERSONAS } from "@/lib/vault-bluff/personas";
import type { ApiResult, ClientCommand } from "./VaultBluffGame";

type FaceoffProps = {
  game: ApiResult;
  pending: boolean;
  error: string | null;
  retryAvailable: boolean;
  onAction: (command: ClientCommand) => void;
  onRetry: () => void;
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
  onAction,
  onRetry,
}: FaceoffProps) {
  const [hintVisible, setHintVisible] = useState(true);
  const persona = PERSONAS[game.session.persona];
  const round = game.session.currentRound;

  return (
    <main className="vq-faceoff" aria-labelledby="faceoff-opponent">
      <button
        type="button"
        aria-label="How to play"
        aria-pressed={hintVisible}
        onClick={() => setHintVisible(true)}
        className="vq-faceoff__help-icon"
      >
        ?
      </button>

      <section className="vq-faceoff__table" aria-label="Vault Bluff table">
        <BotMark />
        <h1 id="faceoff-opponent" className="vq-faceoff__opponent-name">
          {persona.name}
        </h1>
        <p className="vq-faceoff__bot-label">(bot)</p>

        <div className="vq-faceoff__cases" aria-label="Two sealed cases">
          <CaseCard label="Yours" tone="human" />
          <CaseCard label={persona.name} tone="bot" />
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

        {hintVisible ? (
          <div id="faceoff-hint" className="vq-faceoff__hint">
            <p>Keep or take.</p>
            <button type="button" onClick={() => setHintVisible(false)}>
              Skip
            </button>
          </div>
        ) : null}

        <div
          className="vq-faceoff__progress"
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
                  roundNumber < round.number
                    ? "done"
                    : roundNumber === round.number
                      ? "current"
                      : "remaining"
                }
              />
            ))}
          </div>
          <p>
            {game.session.humanScore} - {game.session.botScore}
          </p>
        </div>

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

function CaseCard({
  label,
  tone,
}: {
  label: string;
  tone: "human" | "bot";
}) {
  return (
    <article className="vq-faceoff__case" data-tone={tone}>
      <p>{label}</p>
      <span aria-hidden="true" />
      <strong>Sealed</strong>
    </article>
  );
}

function BotMark() {
  return (
    <span className="vq-faceoff__bot-mark" aria-hidden="true">
      <span />
    </span>
  );
}
