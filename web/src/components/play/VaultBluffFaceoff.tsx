"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type MouseEventHandler,
} from "react";
import {
  VAULT_BLUFF_FACEOFF_PROMPTS,
  type VaultBluffFaceoffPrompt,
} from "@/lib/vault-bluff/faceoff-presentation";
import { PERSONAS } from "@/lib/vault-bluff/personas";
import {
  APPROVED_ANSWERS,
  QUESTIONS,
  type Choice,
  type SafeRoundDto,
} from "@/lib/vault-bluff/types";
import type { ApiResult, ClientCommand } from "./VaultBluffGame";

type FaceoffProps = {
  game: ApiResult;
  pending: boolean;
  error: string | null;
  retryAvailable: boolean;
  revealReady: boolean;
  onTableChoice: (choice: Choice) => void;
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
  onTableChoice,
  onRetry,
  onRematch,
  onNewBot,
  onContinue,
  onContinuePointerDown,
  onContinuePointerReset,
}: FaceoffProps) {
  const [promptSelection, setPromptSelection] = useState<{
    roundNumber: number;
    prompt: VaultBluffFaceoffPrompt;
  } | null>(null);
  const [controlNotice, setControlNotice] = useState<
    "help" | "settings" | null
  >(null);
  const persona = PERSONAS[game.session.persona];
  const round = game.session.currentRound;
  const selectedPrompt =
    promptSelection?.roundNumber === round.number
      ? promptSelection.prompt
      : null;

  return (
    <main className="vq-faceoff" aria-labelledby="faceoff-opponent">
      <div className="vq-faceoff__header-controls">
        <button
          type="button"
          aria-label="How to play"
          aria-expanded={controlNotice === "help"}
          aria-controls="faceoff-control-notice"
          onClick={() =>
            setControlNotice((current) => (current === "help" ? null : "help"))
          }
          className="vq-faceoff__help-icon"
        >
          ?
        </button>
        <button
          type="button"
          aria-label="Settings"
          aria-expanded={controlNotice === "settings"}
          aria-controls="faceoff-control-notice"
          onClick={() =>
            setControlNotice((current) =>
              current === "settings" ? null : "settings",
            )
          }
          className="vq-faceoff__gear-icon"
        >
          <GearIcon />
        </button>
        {controlNotice ? (
          <p
            id="faceoff-control-notice"
            role="status"
            className="vq-faceoff__control-notice"
          >
            {controlNotice === "help"
              ? "Ask one question. Then Keep or Take."
              : "Game settings are fixed for Faceoff."}
          </p>
        ) : null}
      </div>

      <section className="vq-faceoff__table" aria-label="Vault Bluff table">
        <div className="vq-faceoff__opponent">
          <BotMark />
          <div>
            <h1 id="faceoff-opponent" className="vq-faceoff__opponent-name">
              {persona.name} <small>(bot)</small>
            </h1>
            {isTablePhase(round.phase) ? (
              <p
                className="vq-faceoff__prompt-line"
                data-answered={Boolean(selectedPrompt)}
                aria-live="polite"
              >
                {selectedPrompt?.line ?? "Ask one."}
              </p>
            ) : null}
          </div>
        </div>

        {isTablePhase(round.phase) ? (
          <DecisionTable
            round={round}
            personaName={persona.name}
            pending={pending}
            selectedPrompt={selectedPrompt}
            humanScore={game.session.humanScore}
            botScore={game.session.botScore}
            onChoice={onTableChoice}
            onPrompt={(prompt) =>
              setPromptSelection({ roundNumber: round.number, prompt })
            }
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
  selectedPrompt,
  humanScore,
  botScore,
  onChoice,
  onPrompt,
}: {
  round: SafeRoundDto;
  personaName: string;
  pending: boolean;
  selectedPrompt: VaultBluffFaceoffPrompt | null;
  humanScore: number;
  botScore: number;
  onChoice: (choice: Choice) => void;
  onPrompt: (prompt: VaultBluffFaceoffPrompt) => void;
}) {
  const keepChoiceRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (selectedPrompt) keepChoiceRef.current?.focus();
  }, [selectedPrompt]);

  return (
    <>
      <div className="vq-faceoff__arena">
        <div className="vq-faceoff__cases" aria-label="Two sealed cases">
          <CaseCard label="A" owner="yours" tone="human" />
          <CaseCard label="B" owner={personaName} tone="bot" />
        </div>
      </div>
      <div className="vq-faceoff__decision-footer">
        {selectedPrompt ? (
          <>
            <div className="vq-faceoff__selected-prompt">
              <span
                className="vq-faceoff__chip"
                aria-label={`Chosen question: ${selectedPrompt.label}`}
              >
                {selectedPrompt.label}
              </span>
            </div>
            <div className="vq-faceoff__choices" aria-label="Choose a case">
              <button
                ref={keepChoiceRef}
                type="button"
                disabled={pending}
                onClick={() => onChoice("KEEP")}
                className="vq-faceoff__choice vq-faceoff__choice--keep"
              >
                <LockIcon />
                Keep
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => onChoice("TAKE")}
                className="vq-faceoff__choice vq-faceoff__choice--take"
              >
                <SwapIcon />
                Take
              </button>
            </div>
          </>
        ) : (
          <div className="vq-faceoff__question-chips" aria-label="Ask one question">
            {VAULT_BLUFF_FACEOFF_PROMPTS.map((prompt) => (
              <button
                key={prompt.id}
                type="button"
                disabled={pending}
                className="vq-faceoff__chip"
                onClick={() => onPrompt(prompt)}
              >
                {prompt.label}
              </button>
            ))}
          </div>
        )}
        <Progress
          round={round}
          humanScore={humanScore}
          botScore={botScore}
        />
      </div>
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
            label="A"
            owner="yours"
            tone="human"
            status={round.keyCase === "CASE_A" ? "Key" : "Sealed"}
          />
          <CaseCard
            label="B"
            owner={personaName}
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
    <div className="vq-faceoff__progress" data-result={result}>
      <div
        className="vq-faceoff__pips"
        role="progressbar"
        aria-label={`Round ${round.number} of 4`}
        aria-valuemin={1}
        aria-valuemax={4}
        aria-valuenow={round.number}
      >
        {[1, 2, 3, 4].map((roundNumber) => (
          <span
            aria-hidden="true"
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
      <p aria-label={`Score ${humanScore} to ${botScore}`}>
        {humanScore} - {botScore}
      </p>
    </div>
  );
}

function CaseCard({
  label,
  owner,
  tone,
  status = "Sealed",
}: {
  label: string;
  owner: string;
  tone: "human" | "bot";
  status?: "Sealed" | "Key";
}) {
  return (
    <article
      className="vq-faceoff__case"
      data-tone={tone}
      data-status={status.toLowerCase()}
      aria-label={`Case ${label}, ${owner}, ${status.toLowerCase()}`}
    >
      <p>{label}</p>
      <span aria-hidden="true" />
      <strong className="sr-only">{status}</strong>
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

function isTablePhase(phase: SafeRoundDto["phase"]) {
  return (
    phase === "KEEPER_INSPECTION" ||
    phase === "KEEPER_RESPONSE" ||
    phase === "CHOOSER_QUESTIONING" ||
    phase === "CHOOSER_DECISION"
  );
}

export function faceoffTableCommand(
  round: SafeRoundDto,
  choice: Choice,
): ClientCommand | null {
  if (round.phase === "KEEPER_INSPECTION") {
    return { kind: "ACK_INSPECTION" };
  }
  if (round.phase === "KEEPER_RESPONSE") {
    const question = round.questions[round.responses.length];
    if (!question) return null;
    const answers = APPROVED_ANSWERS[question];
    const answer =
      choice === "KEEP" ? answers[0] : (answers[1] ?? answers[0]);
    if (!answer) return null;
    return {
      kind: "ANSWER_QUESTION",
      answer,
      confidence: "UNSURE",
      recommendation: choice,
    };
  }
  if (round.phase === "CHOOSER_QUESTIONING") {
    const available = QUESTIONS.filter(
      (question) => !round.questions.includes(question),
    );
    const question = choice === "KEEP" ? available[0] : available.at(-1);
    return question ? { kind: "ASK_QUESTION", question } : null;
  }
  if (round.phase === "CHOOSER_DECISION") {
    return { kind: "CHOOSE_CASE", choice };
  }
  return null;
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

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M7.5 10V7.5a4.5 4.5 0 0 1 9 0V10m-7-3a2.5 2.5 0 0 1 5 0v3M6 10h12v10H6z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SwapIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="m17 3 4 4-4 4M3 7h18M7 21l-4-4 4-4m14 4H3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
