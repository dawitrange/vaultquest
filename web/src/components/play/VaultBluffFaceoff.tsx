"use client";

import Link from "next/link";
import {
  useState,
  type FormEventHandler,
  type MouseEventHandler,
} from "react";
import { PLAY_REWARDS_OFF_COPY } from "@/lib/site";
import {
  revealSequence,
  roundProgressLabel,
  VAULT_BLUFF_ROUND_COUNT,
} from "@/lib/vault-bluff/faceoff-presentation";
import { PERSONAS } from "@/lib/vault-bluff/personas";
import { captureClientEvent, PH_EVENTS } from "@/lib/posthog-client";
import {
  APPROVED_ANSWERS,
  QUESTION_LABELS,
  QUESTIONS,
  type ApprovedAnswer,
  type Confidence,
  type QuestionId,
  type Recommendation,
  type SafeRoundDto,
} from "@/lib/vault-bluff/types";
import type {
  ApiResult,
  ClientCommand,
  EarnQuest,
} from "./VaultBluffGame";

type FaceoffProps = {
  game: ApiResult;
  completedMatches: number;
  initialTotalXp: number;
  earnQuest: EarnQuest | null;
  activeQuestion: QuestionId | undefined;
  answer: ApprovedAnswer | null;
  confidence: Confidence;
  recommendation: Recommendation;
  pending: boolean;
  pendingAction: ClientCommand["kind"] | null;
  revealReady: boolean;
  roundControlsReady: boolean;
  forfeitConfirmOpen: boolean;
  error: string | null;
  retryAvailable: boolean;
  onAnswerChange: (answer: ApprovedAnswer) => void;
  onConfidenceChange: (confidence: Confidence) => void;
  onRecommendationChange: (recommendation: Recommendation) => void;
  onKeeperResponseSubmit: FormEventHandler<HTMLFormElement>;
  onAction: (command: ClientCommand) => void;
  onRematch: () => void;
  onNewBot: () => void;
  onRetry: () => void;
  onForfeitConfirmChange: (open: boolean) => void;
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
    <div className="vq-faceoff min-h-[calc(100dvh-5rem)] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-6xl rounded-[12px] border border-[var(--vq-border-strong)] bg-[var(--vq-bg-raised)] p-6">
        <p className="font-[family-name:var(--vq-font-mono)] text-xs uppercase tracking-wider text-[var(--vq-warn)]">
          BOT Faceoff
        </p>
        <p role="status" className="mt-3 text-[var(--vq-ink-muted)]">
          {message}
        </p>
        {onRetry ? (
          <button
            type="button"
            disabled={retrying}
            onClick={onRetry}
            className="mt-5 inline-flex min-h-11 items-center rounded-md border border-[var(--vq-border-strong)] px-4 py-2 font-semibold disabled:opacity-50"
          >
            {retrying ? "Retrying..." : "Retry"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function VaultBluffFaceoff(props: FaceoffProps) {
  const { game, pending, forfeitConfirmOpen, onForfeitConfirmChange } = props;
  const round = game.session.currentRound;
  const persona = PERSONAS[game.session.persona];
  const [hintVisible, setHintVisible] = useState(true);

  return (
    <div className="vq-faceoff min-h-[calc(100dvh-4rem)] overflow-x-clip">
      <div className="vq-faceoff__grid">
        <nav className="vq-faceoff__rail" aria-label="Vault Bluff sections">
          <p className="font-[family-name:var(--vq-font-mono)] text-[0.65rem] uppercase tracking-wider text-[var(--vq-teal)]">
            Play
          </p>
          <Link href="/play" className="vq-faceoff__rail-link">
            Play Home
          </Link>
          <span className="vq-faceoff__rail-link vq-faceoff__rail-link--active">
            Bot Faceoff
          </span>
          <p className="mt-auto pt-8 font-[family-name:var(--vq-font-mono)] text-[0.65rem] uppercase text-[var(--vq-warn)]">
            Game rewards are off
          </p>
          <p className="mt-2 text-xs text-[var(--vq-ink-faint)]">
            Play and XP stay available.
          </p>
        </nav>

        <main className="vq-faceoff__main">
          <div className="vq-faceoff__topbar">
            <div>
              <p className="font-[family-name:var(--vq-font-mono)] text-xs uppercase tracking-wider text-[var(--vq-warn)]">
                BOT Faceoff
              </p>
              <h1 className="mt-1 hidden font-[family-name:var(--vq-font-display)] text-2xl font-semibold md:block">
                {faceoffHeading(round.phase)}
              </h1>
            </div>
            <button
              type="button"
              onClick={() => setHintVisible(true)}
              className="vq-faceoff__help-button"
            >
              How to play
            </button>
          </div>

          <section
            className="vq-faceoff__opponent"
            aria-label={`${persona.name}, BOT scripted opponent`}
          >
            <BotMark />
            <h2 className="font-[family-name:var(--vq-font-display)] text-2xl font-semibold uppercase">
              {persona.name} <span className="text-[var(--vq-warn)]">(bot)</span>
            </h2>
          </section>

          <RoundRail currentRound={round.number} />
          {hintVisible &&
          round.phase !== "ROUND_REVEAL" &&
          round.phase !== "MATCH_COMPLETE" ? (
            <Hint onSkip={() => setHintVisible(false)} />
          ) : null}

          <FaceoffStage {...props} />

          {round.phase !== "ROUND_REVEAL" &&
          round.phase !== "MATCH_COMPLETE" ? (
            <RewardsOff />
          ) : null}

          {!game.session.completed ? (
            <ForfeitOptions
              pending={pending}
              open={forfeitConfirmOpen}
              onOpenChange={onForfeitConfirmChange}
              onConfirm={() => props.onAction({ kind: "FORFEIT" })}
            />
          ) : null}

          <p className="mt-4 text-xs text-[var(--vq-ink-faint)]">
            Four rounds. No timer. No automatic rematch.
          </p>
        </main>
      </div>
    </div>
  );
}

function FaceoffStage(props: FaceoffProps) {
  const { game, error, retryAvailable, pending } = props;
  const round = game.session.currentRound;

  return (
    <div className="mt-4">
      {round.phase === "KEEPER_INSPECTION" ? (
        <section aria-labelledby="faceoff-inspection-title">
          <StageHeading
            eyebrow="Private inspection"
            title="Check your case."
            description="Only your case status is shown. The BOT does not receive it."
            id="faceoff-inspection-title"
          />
          <FaceoffCases round={round} inspection />
          <button
            type="button"
            disabled={pending}
            onClick={() => props.onAction({ kind: "ACK_INSPECTION" })}
            className="vq-faceoff__primary mt-4"
          >
            Ready for questions
          </button>
        </section>
      ) : null}

      {round.phase === "KEEPER_RESPONSE" && props.activeQuestion ? (
        <form
          aria-labelledby="faceoff-response-title"
          onSubmit={props.onKeeperResponseSubmit}
        >
          <StageHeading
            eyebrow={`BOT asks · question ${round.responses.length + 1} of 2`}
            title={QUESTION_LABELS[props.activeQuestion]}
            description="Choose one structured response. Free-form chat is not used."
            id="faceoff-response-title"
          />
          <fieldset className="mt-5">
            <legend className="text-sm font-semibold">Your response</legend>
            <input type="hidden" name="answer" value={props.answer ?? ""} />
            <div className="mt-2 flex flex-wrap gap-2">
              {APPROVED_ANSWERS[props.activeQuestion].map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={props.answer === option}
                  onClick={() => props.onAnswerChange(option)}
                  className="vq-faceoff__chip"
                  data-selected={props.answer === option}
                >
                  {humanize(option)}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <CompactChoiceGroup
              label="Confidence"
              name="confidence"
              value={props.confidence}
              options={["CERTAIN", "UNSURE", "GUESSING"]}
              onChange={(value) => props.onConfidenceChange(value as Confidence)}
            />
            <CompactChoiceGroup
              label="Recommendation"
              name="recommendation"
              value={props.recommendation}
              options={["KEEP", "TAKE"]}
              onChange={(value) =>
                props.onRecommendationChange(value as Recommendation)
              }
            />
          </div>
          {props.pendingAction === "ANSWER_QUESTION" &&
          round.responses.length === 1 ? (
            <p role="status" className="vq-faceoff__status mt-4">
              BOT is choosing a structured response...
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="vq-faceoff__primary mt-4"
          >
            {props.pendingAction === "ANSWER_QUESTION"
              ? "Locking response..."
              : "Lock response"}
          </button>
        </form>
      ) : null}

      {round.phase === "CHOOSER_QUESTIONING" ? (
        <section aria-labelledby="faceoff-question-title">
          <StageHeading
            eyebrow={`Your questions · ${round.questions.length} of 2 asked`}
            title={`Read ${PERSONAS[game.session.persona].name}.`}
            description="Ask two structured questions. BOT answers are scripted and imperfect."
            id="faceoff-question-title"
          />
          <FaceoffCases round={round} />
          {!props.roundControlsReady && round.questions.length === 0 ? (
            <p role="status" className="vq-faceoff__status mt-4">
              New round ready. Questions unlock in a moment...
            </p>
          ) : null}
          {props.pendingAction === "ASK_QUESTION" ? (
            <p role="status" className="vq-faceoff__status mt-4">
              BOT is answering...
            </p>
          ) : null}
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                disabled={
                  pending ||
                  !props.roundControlsReady ||
                  round.questions.includes(question)
                }
                onClick={() =>
                  props.onAction({ kind: "ASK_QUESTION", question })
                }
                className="min-h-11 rounded-md border border-[var(--vq-border)] bg-[var(--vq-bg-raised)] p-3 text-left text-sm hover:border-[var(--vq-teal)] disabled:opacity-35"
              >
                {QUESTION_LABELS[question]}
              </button>
            ))}
          </div>
          <SignalHistory round={round} />
        </section>
      ) : null}

      {round.phase === "CHOOSER_DECISION" ? (
        <section aria-labelledby="faceoff-decision-title">
          <h2 id="faceoff-decision-title" className="sr-only">
            Keep Case A or take Case B
          </h2>
          <ScoreLine
            humanScore={game.session.humanScore}
            botScore={game.session.botScore}
          />
          <FaceoffCases round={round} />
          <div className="vq-faceoff__choices">
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                props.onAction({ kind: "CHOOSE_CASE", choice: "KEEP" })
              }
              className="vq-faceoff__choice vq-faceoff__choice--keep"
            >
              Keep Case A · K
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                props.onAction({ kind: "CHOOSE_CASE", choice: "TAKE" })
              }
              className="vq-faceoff__choice vq-faceoff__choice--take"
            >
              Take Case B · T
            </button>
          </div>
        </section>
      ) : null}

      {round.phase === "ROUND_REVEAL" ? (
        <RevealStage {...props} round={round} />
      ) : null}

      {round.phase === "MATCH_COMPLETE" ? (
        <MatchComplete {...props} />
      ) : null}

      {error ? (
        <section role="alert" className="vq-faceoff__error">
          <h2 className="font-semibold text-[var(--vq-danger)]">
            Match connection issue
          </h2>
          <p className="mt-1 text-sm text-[var(--vq-ink-muted)]">{error}</p>
          {retryAvailable ? (
            <button
              type="button"
              disabled={pending}
              onClick={props.onRetry}
              className="mt-3 min-h-11 rounded-md border border-[var(--vq-danger)] px-4 py-2 text-sm font-semibold"
            >
              {pending ? "Retrying..." : "Retry"}
            </button>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

function RevealStage(props: FaceoffProps & { round: SafeRoundDto }) {
  const { round, pending, revealReady } = props;
  const steps = revealSequence(round);

  return (
    <section aria-labelledby="faceoff-reveal-title">
      <h2 id="faceoff-reveal-title" className="sr-only">
        Round reveal
      </h2>
      <ScoreLine
        humanScore={props.game.session.humanScore}
        botScore={props.game.session.botScore}
      />
      <FaceoffCases round={round} revealed />
      <div className="vq-faceoff__reveal-panel">
        <p className="font-[family-name:var(--vq-font-mono)] text-xs uppercase text-[var(--vq-teal)]">
          Reveal
        </p>
        <ol className="vq-faceoff__reveal-steps" aria-label="Reveal sequence">
          {steps.map((step) => (
            <li key={step.label}>
              <p className="font-[family-name:var(--vq-font-mono)] text-xs uppercase text-[var(--vq-warn)]">
                {step.label}
              </p>
              <p className="mt-1 font-semibold">{step.body}</p>
            </li>
          ))}
        </ol>
        <p className="vq-faceoff__why">
          <span>Why?</span>
          Hints are imperfect, never proof.
        </p>
      </div>
      {!revealReady ? (
        <p role="status" className="mt-4 text-sm text-[var(--vq-ink-muted)]">
          Continue is held briefly.
        </p>
      ) : null}
      <button
        type="button"
        disabled={pending || !revealReady}
        onPointerDown={props.onContinuePointerDown}
        onPointerCancel={props.onContinuePointerReset}
        onPointerLeave={props.onContinuePointerReset}
        onClick={props.onContinue}
        className="vq-faceoff__continue"
      >
        {!revealReady
          ? "Continue available shortly"
          : round.number === VAULT_BLUFF_ROUND_COUNT
            ? "Continue to match result"
            : "Continue to next round"}
      </button>
    </section>
  );
}

function MatchComplete(props: FaceoffProps) {
  const { game, pending } = props;

  return (
    <section aria-labelledby="faceoff-match-title">
      <h2 id="faceoff-match-title" className="sr-only">
        Match complete
      </h2>
      <ScoreLine
        humanScore={game.session.humanScore}
        botScore={game.session.botScore}
      />
      <p className="mt-2 text-sm text-[var(--vq-ink-muted)]">
        4 of 4 complete · no automatic rematch
      </p>
      <div
        className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4"
        aria-label="Post-match choices"
      >
        <button
          type="button"
          disabled={pending}
          onClick={props.onRematch}
          className="vq-faceoff__equal-action"
        >
          Rematch
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={props.onNewBot}
          className="vq-faceoff__equal-action"
        >
          New BOT
        </button>
        <Link href="/earn" className="vq-faceoff__equal-action">
          Explore VaultQuest
        </Link>
        <Link href="/play" className="vq-faceoff__equal-action">
          Done
        </Link>
      </div>
      <EarnRecommendation earnQuest={props.earnQuest} />
      <p className="mt-3 text-xs text-[var(--vq-ink-faint)]">
        +{game.session.xpAwarded} XP ·{" "}
        {props.initialTotalXp + game.session.xpAwarded} total
      </p>
      <RewardsOff />
    </section>
  );
}

function EarnRecommendation({ earnQuest }: { earnQuest: EarnQuest | null }) {
  return (
    <aside className="mt-4 rounded-[10px] border border-[var(--vq-info)] bg-[var(--vq-bg-raised)] p-4">
      <p className="text-xs uppercase tracking-wider text-[var(--vq-info)]">
        Explore · after match only
      </p>
      {earnQuest ? (
        <>
          <h3 className="mt-1 font-semibold">{earnQuest.title}</h3>
          <p className="mt-2 text-sm text-[var(--vq-ink-muted)]">
            {earnQuest.vpReward} VP · {earnQuest.effort} · {earnQuest.timeHint}
          </p>
          <p className="mt-2 text-xs text-[var(--vq-ink-faint)]">
            Optional. Clicking pays nothing.
          </p>
          <a
            href={`/api/go/${earnQuest.id}`}
            onClick={() =>
              captureClientEvent(PH_EVENTS.vault_bluff_earn_clicked, {
                quest_id: earnQuest.id,
                vp: earnQuest.vpReward,
                hold_days: earnQuest.holdDays,
              })
            }
            className="mt-3 inline-flex min-h-11 items-center rounded-md border border-[var(--vq-border-strong)] px-4 py-2 text-sm font-semibold"
          >
            Explore quest
          </a>
        </>
      ) : (
        <p className="mt-2 text-sm text-[var(--vq-ink-muted)]">
          The match is over. Explore VaultQuest or choose Done.
        </p>
      )}
    </aside>
  );
}

function StageHeading({
  eyebrow,
  title,
  description,
  id,
}: {
  eyebrow: string;
  title: string;
  description: string;
  id: string;
}) {
  return (
    <header>
      <p className="font-[family-name:var(--vq-font-mono)] text-xs uppercase tracking-wider text-[var(--vq-teal)]">
        {eyebrow}
      </p>
      <h2 id={id} className="mt-1 text-2xl font-semibold">
        {title}
      </h2>
      <p className="mt-2 text-sm text-[var(--vq-ink-muted)]">{description}</p>
    </header>
  );
}

function FaceoffCases({
  round,
  inspection = false,
  revealed = false,
}: {
  round: SafeRoundDto;
  inspection?: boolean;
  revealed?: boolean;
}) {
  return (
    <div className="mt-5 grid grid-cols-2 gap-3" aria-label="Case A and Case B">
      {(["CASE_A", "CASE_B"] as const).map((caseId) => {
        const keyIsHere = revealed && round.keyCase === caseId;
        const inspectionStatus =
          inspection && caseId === round.humanCase
            ? round.keeperHasKey
              ? "Key inside"
              : "Empty"
            : "Sealed";
        return (
          <div
            key={caseId}
            className="vq-faceoff__case"
            data-owner={caseId === round.humanCase ? "human" : "bot"}
            data-key={keyIsHere}
          >
            <p className="font-[family-name:var(--vq-font-mono)] text-[0.65rem] uppercase text-[var(--vq-ink-muted)]">
              {caseId === "CASE_A" ? "Case A · Yours" : "Case B · BOT"}
            </p>
            <p className="mt-4 text-lg font-semibold uppercase">
              {keyIsHere ? "Key revealed" : inspectionStatus}
            </p>
            <p className="mt-2 text-xs text-[var(--vq-ink-muted)]">
              {keyIsHere
                ? "Key shown after the choice."
                : caseId === round.humanCase
                  ? "Keep or trade."
                  : "Still sealed."}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function SignalHistory({ round }: { round: SafeRoundDto }) {
  if (round.responses.length === 0) return null;
  return (
    <section className="mt-4" aria-labelledby="bot-signals-title">
      <h3
        id="bot-signals-title"
        className="font-[family-name:var(--vq-font-mono)] text-xs uppercase text-[var(--vq-warn)]"
      >
        BOT signals
      </h3>
      <ol className="mt-2 grid gap-2 sm:grid-cols-2">
        {round.responses.map((response, index) => (
          <li
            key={`${response.question}-${index}`}
            className="rounded-md border border-[var(--vq-border)] bg-[var(--vq-bg-sunken)] p-3 text-sm"
          >
            <p className="text-xs text-[var(--vq-ink-faint)]">
              {QUESTION_LABELS[response.question]}
            </p>
            <p className="mt-1">{humanize(response.answer)}</p>
            <p className="mt-1 text-xs text-[var(--vq-ink-muted)]">
              {humanize(response.confidence)} · recommends{" "}
              {response.recommendation.toLowerCase()}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ScoreLine({
  humanScore,
  botScore,
}: {
  humanScore: number;
  botScore: number;
}) {
  return (
    <p className="vq-faceoff__score">
      You {humanScore} <span aria-hidden="true">·</span> Bot {botScore}
    </p>
  );
}

function RoundRail({ currentRound }: { currentRound: number }) {
  return (
    <div className="vq-faceoff__round">
      <span>{roundProgressLabel(currentRound)}</span>
      <div
        className="flex items-center gap-2"
        role="progressbar"
        aria-label={roundProgressLabel(currentRound)}
        aria-valuemin={1}
        aria-valuemax={VAULT_BLUFF_ROUND_COUNT}
        aria-valuenow={currentRound}
      >
        {[1, 2, 3, 4].map((value) => (
          <span
            key={value}
            className="vq-round-dot"
            data-state={
              value < currentRound
                ? "done"
                : value === currentRound
                  ? "current"
                  : "remaining"
            }
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
}

function Hint({ onSkip }: { onSkip: () => void }) {
  return (
    <aside id="faceoff-hint" className="vq-faceoff__hint">
      <p>
        <span>Hint</span> Pick the case you trust.
      </p>
      <button type="button" onClick={onSkip}>
        Skip
      </button>
    </aside>
  );
}

function RewardsOff() {
  return (
    <aside className="mt-4 rounded-[10px] border border-[var(--vq-warn)]/45 bg-[#19160d] p-4">
      <p className="font-[family-name:var(--vq-font-mono)] text-xs uppercase text-[var(--vq-warn)]">
        Rewards off
      </p>
      <p className="mt-1 text-xs text-[var(--vq-ink-muted)]">
        {PLAY_REWARDS_OFF_COPY} No cash prize or easy-money claim.
      </p>
    </aside>
  );
}

function ForfeitOptions({
  pending,
  open,
  onOpenChange,
  onConfirm,
}: {
  pending: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <section
      id="faceoff-match-options"
      className="mt-4"
      aria-label="Match options"
    >
      {open ? (
        <div className="rounded-[10px] border border-[var(--vq-danger)]/50 bg-[var(--vq-danger)]/10 p-4">
          <h2 className="font-semibold text-[var(--vq-danger)]">
            Forfeit this match?
          </h2>
          <p className="mt-1 text-sm text-[var(--vq-ink-muted)]">
            The match ends with no XP or promotional VP and will not train player
            memory.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => onOpenChange(false)}
              className="min-h-11 rounded-md border border-[var(--vq-border-strong)] px-4 py-2 text-sm font-semibold"
            >
              Keep playing
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                onOpenChange(false);
                onConfirm();
              }}
              className="min-h-11 rounded-md border border-[var(--vq-danger)] px-4 py-2 text-sm font-semibold text-[var(--vq-danger)]"
            >
              Confirm forfeit
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => onOpenChange(true)}
          className="min-h-11 rounded-md border border-[var(--vq-border)] px-4 py-2 text-sm text-[var(--vq-ink-faint)]"
        >
          Forfeit options
        </button>
      )}
    </section>
  );
}

function CompactChoiceGroup({
  label,
  name,
  value,
  options,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="text-sm">
      <legend className="mb-1 font-semibold">{label}</legend>
      <input type="hidden" name={name} value={value} />
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
            className="vq-faceoff__chip"
            data-selected={value === option}
          >
            {humanize(option)}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function BotMark() {
  return (
    <span className="vq-faceoff__bot-mark" aria-hidden="true">
      <span />
    </span>
  );
}


function humanize(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function faceoffHeading(phase: SafeRoundDto["phase"]) {
  if (phase === "ROUND_REVEAL") return "Signal, read, outcome.";
  if (phase === "MATCH_COMPLETE") return "Match complete.";
  return "Make the call.";
}
