"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
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

type TellStrength = "NONE" | "SUBTLE" | "NOTICEABLE";

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
        <p className="mt-2 text-sm text-[var(--vq-ink-faint)]">
          BOT / scripted opponent
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
  const {
    game,
    pending,
    forfeitConfirmOpen,
    onForfeitConfirmChange,
  } = props;
  const round = game.session.currentRound;
  const persona = PERSONAS[game.session.persona];
  const gearRef = useRef<HTMLButtonElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tellStrength, setTellStrength] = useState<TellStrength>("SUBTLE");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [compactRail, setCompactRail] = useState(true);

  function closeSettings() {
    setSettingsOpen(false);
    queueMicrotask(() => gearRef.current?.focus());
  }

  return (
    <div
      className={`vq-faceoff min-h-[calc(100dvh-4rem)] overflow-x-clip ${
        reducedMotion ? "vq-faceoff--reduced-motion" : ""
      } ${compactRail ? "vq-faceoff--compact-rail" : ""}`}
    >
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
          <a href="#faceoff-help" className="vq-faceoff__rail-link">
            How to play
          </a>
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
                Make the call across the table.
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <RoundBadge roundNumber={round.number} />
              <button
                ref={gearRef}
                type="button"
                aria-label="Open match settings"
                aria-haspopup="dialog"
                aria-expanded={settingsOpen}
                onClick={() => setSettingsOpen(true)}
                className="vq-faceoff__gear"
              >
                <GearIcon />
              </button>
            </div>
          </div>

          <section
            className="vq-faceoff__opponent"
            aria-label={`${persona.name}, BOT scripted opponent`}
          >
            <BotMark />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-[var(--vq-warn)] px-3 py-1 font-[family-name:var(--vq-font-mono)] text-xs font-bold text-[var(--vq-bg-deep)]">
                  BOT
                </span>
                <h2 className="font-[family-name:var(--vq-font-display)] text-2xl font-semibold uppercase">
                  {persona.name}
                </h2>
              </div>
              <p className="mt-1 text-sm text-[var(--vq-ink-muted)]">
                Scripted opponent · {persona.style}
              </p>
              <p className="mt-3 inline-flex min-h-11 items-center rounded-md border border-[var(--vq-warn)]/60 bg-[var(--vq-bg-sunken)] px-4 font-[family-name:var(--vq-font-mono)] text-xs uppercase text-[var(--vq-warn)]">
                BOT / scripted opponent
              </p>
            </div>
            <div className="ml-auto hidden text-right text-xs text-[var(--vq-ink-faint)] lg:block">
              <p className="font-semibold text-[var(--vq-warn)]">Always a BOT</p>
              <p className="mt-1">No live player · no chat</p>
            </div>
          </section>

          <DramatizationStrip round={round} />

          <FaceoffStage {...props} />

          <ScoreRail
            humanScore={game.session.humanScore}
            botScore={game.session.botScore}
            roundNumber={round.number}
          />

          <RewardsOff />

          {!game.session.completed ? (
            <ForfeitOptions
              pending={pending}
              open={forfeitConfirmOpen}
              onOpenChange={onForfeitConfirmChange}
              onConfirm={() => props.onAction({ kind: "FORFEIT" })}
            />
          ) : null}

          <p className="mt-4 text-xs text-[var(--vq-ink-faint)]">
            Server-authoritative · structured responses only · no cash or random prize
          </p>
        </main>

        <ContextHelp round={round} />
      </div>

      <MobileNav />

      {settingsOpen ? (
        <FaceoffSettings
          tellStrength={tellStrength}
          reducedMotion={reducedMotion}
          compactRail={compactRail}
          onTellStrengthChange={setTellStrength}
          onReducedMotionChange={setReducedMotion}
          onCompactRailChange={setCompactRail}
          onClose={closeSettings}
        />
      ) : null}
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
            <FaceoffSelect
              label="Confidence"
              name="confidence"
              value={props.confidence}
              options={["CERTAIN", "UNSURE", "GUESSING"]}
              onChange={(value) => props.onConfidenceChange(value as Confidence)}
            />
            <FaceoffSelect
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
          <StageHeading
            eyebrow="Your read"
            title="Keep Case A or take Case B?"
            description="Both cases stay sealed until your choice is locked."
            id="faceoff-decision-title"
          />
          <SignalHistory round={round} />
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
      <StageHeading
        eyebrow="Reveal"
        title="Read locked. Key revealed."
        description="The sequence stays visible so the result cannot replace the read."
        id="faceoff-reveal-title"
      />
      <ol className="mt-5 grid gap-3 lg:grid-cols-3" aria-label="Reveal sequence">
        {steps.map((step, index) => (
          <li
            key={step.label}
            className="rounded-[10px] border border-[var(--vq-border-strong)] bg-[var(--vq-bg-sunken)] p-4"
          >
            <p className="font-[family-name:var(--vq-font-mono)] text-xs uppercase text-[var(--vq-teal)]">
              {index + 1}. {step.label}
            </p>
            <p className="mt-2 text-sm">{step.body}</p>
          </li>
        ))}
      </ol>
      <FaceoffCases round={round} revealed />
      {!revealReady ? (
        <p role="status" className="mt-4 text-sm text-[var(--vq-ink-muted)]">
          Continue unlocks after the result settles.
        </p>
      ) : null}
      <button
        type="button"
        disabled={pending || !revealReady}
        onPointerDown={props.onContinuePointerDown}
        onPointerCancel={props.onContinuePointerReset}
        onPointerLeave={props.onContinuePointerReset}
        onClick={props.onContinue}
        className="vq-faceoff__primary mt-4"
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
  const result = game.session.forfeited
    ? "Match forfeited"
    : game.session.humanScore > game.session.botScore
      ? "Match won"
      : game.session.humanScore < game.session.botScore
        ? "Match lost"
        : "Match tied";

  return (
    <section aria-labelledby="faceoff-match-title">
      <StageHeading
        eyebrow="Match result"
        title={result}
        description={`Final score: you ${game.session.humanScore}, BOT ${game.session.botScore}.`}
        id="faceoff-match-title"
      />
      <div className="mt-5 rounded-[10px] border border-[var(--vq-border)] bg-[var(--vq-bg-sunken)] p-4">
        <p className="text-xs uppercase tracking-wider text-[var(--vq-ink-faint)]">
          XP earned
        </p>
        <p className="mt-1 font-[family-name:var(--vq-font-mono)] text-2xl text-[var(--vq-teal)]">
          +{game.session.xpAwarded} XP
        </p>
        <p className="mt-1 text-xs text-[var(--vq-ink-muted)]">
          {props.initialTotalXp + game.session.xpAwarded} total XP
        </p>
      </div>
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
          Explore
        </Link>
        <Link href="/play" className="vq-faceoff__equal-action">
          Done
        </Link>
      </div>
      {props.completedMatches + (game.session.forfeited ? 0 : 1) >= 3 ? (
        <EarnRecommendation earnQuest={props.earnQuest} />
      ) : null}
    </section>
  );
}

function EarnRecommendation({ earnQuest }: { earnQuest: EarnQuest | null }) {
  return (
    <aside className="mt-6 rounded-[10px] border border-[var(--vq-border)] bg-[var(--vq-bg-raised)] p-4">
      <p className="text-xs uppercase tracking-wider text-[var(--vq-ink-faint)]">
        Optional verified quest
      </p>
      {earnQuest ? (
        <>
          <h3 className="mt-1 font-semibold">{earnQuest.title}</h3>
          <p className="mt-2 text-sm text-[var(--vq-ink-muted)]">
            {earnQuest.vpReward} VP · {earnQuest.effort} effort ·{" "}
            {earnQuest.timeHint} · {earnQuest.holdDays}-day hold
          </p>
          <p className="mt-2 text-xs text-[var(--vq-ink-faint)]">
            Clicking pays nothing. VP posts only after verified completion.
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
            Open optional quest
          </a>
        </>
      ) : (
        <p className="mt-2 text-sm text-[var(--vq-ink-muted)]">
          No healthy partner quest is available right now. Check Earn later.
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
                ? "The Vault Key was in this case."
                : caseId === round.humanCase
                  ? "Your assigned case."
                  : "Scripted opponent case."}
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

function DramatizationStrip({ round }: { round: SafeRoundDto }) {
  const botLine =
    round.humanRole === "CHOOSER" && round.responses.length > 0
      ? `"${humanize(round.responses.at(-1)?.answer ?? "UNSURE")}."`
      : round.phase === "ROUND_REVEAL" && round.humanRole === "KEEPER"
        ? round.choice === "KEEP"
          ? '"I will keep Case B."'
          : '"I will take Case A."'
        : "BOT signal pending.";
  return (
    <section className="vq-faceoff__dramatization" aria-label="Dramatization">
      <span className="rounded-md border border-[var(--vq-warn)]/60 px-3 py-2 font-[family-name:var(--vq-font-mono)] text-[0.65rem] uppercase text-[var(--vq-warn)]">
        Dramatization
      </span>
      <div>
        <p className="text-sm font-semibold">{botLine}</p>
        <p className="mt-1 text-[0.65rem] text-[var(--vq-ink-faint)]">
          Authored structured BOT response, not live typing.
        </p>
      </div>
    </section>
  );
}

function ScoreRail({
  humanScore,
  botScore,
  roundNumber,
}: {
  humanScore: number;
  botScore: number;
  roundNumber: number;
}) {
  return (
    <div className="vq-faceoff__score" aria-label="Match score and round progress">
      <span>You {humanScore}</span>
      <span>BOT {botScore}</span>
      <div
        className="flex items-center gap-2"
        role="progressbar"
        aria-label={roundProgressLabel(roundNumber)}
        aria-valuemin={1}
        aria-valuemax={VAULT_BLUFF_ROUND_COUNT}
        aria-valuenow={roundNumber}
      >
        {[1, 2, 3, 4].map((value) => (
          <span
            key={value}
            className="vq-round-dot"
            data-state={
              value < roundNumber
                ? "done"
                : value === roundNumber
                  ? "current"
                  : "remaining"
            }
            aria-hidden="true"
          />
        ))}
        <span className="ml-1 text-xs text-[var(--vq-ink-muted)]">
          R{roundNumber}/4
        </span>
      </div>
    </div>
  );
}

function RoundBadge({ roundNumber }: { roundNumber: number }) {
  return (
    <span className="inline-flex min-h-11 items-center rounded-full border border-[var(--vq-info)] px-4 font-[family-name:var(--vq-font-mono)] text-xs uppercase text-[var(--vq-info)]">
      {roundProgressLabel(roundNumber)}
    </span>
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

function ContextHelp({ round }: { round: SafeRoundDto }) {
  const copy: Record<SafeRoundDto["phase"], string> = {
    KEEPER_INSPECTION: "Inspect your case, then lock it before questions begin.",
    KEEPER_RESPONSE: "Answer the BOT with the listed structured choices.",
    CHOOSER_QUESTIONING: "Ask two questions. BOT answers may bluff.",
    CHOOSER_DECISION: "Use the recorded answers, then keep or take.",
    ROUND_REVEAL: "Review the signal, your read, and the outcome in order.",
    MATCH_COMPLETE: "Choose one next step. Nothing starts automatically.",
  };
  return (
    <aside id="faceoff-help" className="vq-faceoff__help" aria-label="Contextual help">
      <p className="font-[family-name:var(--vq-font-mono)] text-xs uppercase text-[var(--vq-info)]">
        Playable help
      </p>
      <h2 className="mt-2 font-semibold">This step</h2>
      <p className="mt-2 text-sm text-[var(--vq-ink-muted)]">{copy[round.phase]}</p>
      <details className="mt-4 border-t border-[var(--vq-border)] pt-4 text-sm">
        <summary className="min-h-11 cursor-pointer py-3 font-semibold text-[var(--vq-teal)]">
          Round rules
        </summary>
        <p className="mt-2 text-[var(--vq-ink-muted)]">
          The server fixes key placement before play. BOT behavior cannot move it.
          Hints are imperfect, never proof.
        </p>
      </details>
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
    <section className="mt-4" aria-label="Match options">
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

function FaceoffSettings({
  tellStrength,
  reducedMotion,
  compactRail,
  onTellStrengthChange,
  onReducedMotionChange,
  onCompactRailChange,
  onClose,
}: {
  tellStrength: TellStrength;
  reducedMotion: boolean;
  compactRail: boolean;
  onTellStrengthChange: (value: TellStrength) => void;
  onReducedMotionChange: (value: boolean) => void;
  onCompactRailChange: (value: boolean) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="faceoff-settings-title"
      className="vq-faceoff__settings"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="vq-faceoff__settings-panel">
        <div className="flex items-center justify-between gap-4">
          <h2
            id="faceoff-settings-title"
            className="font-[family-name:var(--vq-font-display)] text-lg font-semibold uppercase text-[var(--vq-warn)]"
          >
            Match settings
          </h2>
          <button
            type="button"
            autoFocus
            onClick={onClose}
            className="min-h-11 min-w-11 rounded-md px-3 text-xs uppercase text-[var(--vq-ink-muted)]"
          >
            Close
          </button>
        </div>

        <fieldset className="mt-3">
          <div className="flex items-center justify-between gap-3">
            <legend className="text-sm font-semibold">Tell strength</legend>
            <span className="font-[family-name:var(--vq-font-mono)] text-xs uppercase text-[var(--vq-warn)]">
              Phase A · UI only
            </span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {(["NONE", "SUBTLE", "NOTICEABLE"] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={tellStrength === value}
                onClick={() => onTellStrengthChange(value)}
                className="vq-faceoff__setting-choice"
                data-selected={tellStrength === value}
              >
                {value}
              </button>
            ))}
          </div>
          <p className="mt-2 text-center text-xs text-[var(--vq-warn)]">
            SUBTLE is Recommended
          </p>
          <p className="mt-1 text-xs text-[var(--vq-ink-faint)]">
            This preview control does not change engine, cue, or hint behavior.
          </p>
        </fieldset>

        <section className="vq-faceoff__settings-note">
          <h3 className="font-semibold text-[var(--vq-info)]">
            How BOT tells work
          </h3>
          <p className="mt-2 text-sm">
            Hints are imperfect, never proof. Treat them as uncertain game flavor,
            not evidence of hidden truth, key location, or a guaranteed bluff.
          </p>
        </section>

        <section className="vq-faceoff__settings-note vq-faceoff__settings-note--warn">
          <h3 className="font-semibold text-[var(--vq-warn)]">Dramatization</h3>
          <p className="mt-2 text-sm">
            Dramatized copy is authored UI text. Phase A adds no live composition,
            timed typing, reactions, or another person on the other side.
          </p>
        </section>

        <label className="vq-faceoff__toggle-row">
          <input
            type="checkbox"
            checked={reducedMotion}
            onChange={(event) => onReducedMotionChange(event.target.checked)}
            className="h-5 w-5 accent-[var(--vq-teal)]"
          />
          <span>Reduced motion</span>
        </label>
        <label className="vq-faceoff__toggle-row">
          <input
            type="checkbox"
            checked={compactRail}
            onChange={(event) => onCompactRailChange(event.target.checked)}
            className="h-5 w-5 accent-[var(--vq-teal)]"
          />
          <span>Compact rail density</span>
        </label>
        <p className="mt-3 text-xs text-[var(--vq-ink-faint)]">
          Presentation settings only. Match rules and BOT behavior stay unchanged.
        </p>
      </div>
    </dialog>
  );
}

function FaceoffSelect({
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
    <label className="text-sm">
      <span className="mb-1 block font-semibold">{label}</span>
      <select
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 w-full rounded-md border border-[var(--vq-border)] bg-[var(--vq-bg-sunken)] px-3 py-2"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {humanize(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function MobileNav() {
  return (
    <nav className="vq-faceoff__mobile-nav" aria-label="Mobile game navigation">
      <Link href="/play">Home</Link>
      <span aria-current="page">Play</span>
      <a href="#faceoff-help">Help</a>
    </nav>
  );
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
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path
        d="M12 8.25A3.75 3.75 0 1 0 12 15.75 3.75 3.75 0 0 0 12 8.25ZM19.1 13.2l1.45 1.13-1.8 3.12-1.7-.7a7.9 7.9 0 0 1-2.1 1.22L14.7 19.8h-3.6l-.25-1.83a7.9 7.9 0 0 1-2.1-1.22l-1.7.7-1.8-3.12L6.7 13.2a8.2 8.2 0 0 1 0-2.4L5.25 9.67l1.8-3.12 1.7.7a7.9 7.9 0 0 1 2.1-1.22L11.1 4.2h3.6l.25 1.83a7.9 7.9 0 0 1 2.1 1.22l1.7-.7 1.8 3.12-1.45 1.13a8.2 8.2 0 0 1 0 2.4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function humanize(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
