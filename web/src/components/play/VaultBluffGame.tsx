"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
} from "react";
import { captureClientEvent, PH_EVENTS } from "@/lib/posthog-client";
import { canSubmitRevealContinue } from "@/lib/vault-bluff/interaction-guards";
import { shouldRenderVaultBluffFaceoff } from "@/lib/vault-bluff/faceoff-presentation";
import { PERSONAS } from "@/lib/vault-bluff/personas";
import { parseKeeperResponseForm } from "@/lib/vault-bluff/response-form";
import {
  APPROVED_ANSWERS,
  PERSONA_IDS,
  QUESTION_LABELS,
  QUESTIONS,
  type ApprovedAnswer,
  type Confidence,
  type PersonaId,
  type Recommendation,
  type SafeSessionDto,
} from "@/lib/vault-bluff/types";
import {
  VaultBluffFaceoff,
  VaultBluffFaceoffLoading,
} from "./VaultBluffFaceoff";

export type ApiResult = {
  id: string;
  version: number;
  session: SafeSessionDto;
  reward:
    | { kind: "granted"; vp: number; availableAt: string }
    | { kind: "blocked"; reason: string }
    | null;
};

export type ClientCommand =
  | { kind: "ACK_INSPECTION" }
  | { kind: "ASK_QUESTION"; question: (typeof QUESTIONS)[number] }
  | {
      kind: "ANSWER_QUESTION";
      answer: ApprovedAnswer;
      confidence: Confidence;
      recommendation: Recommendation;
    }
  | { kind: "CHOOSE_CASE"; choice: "KEEP" | "TAKE" }
  | { kind: "NEXT_ROUND" }
  | { kind: "FORFEIT" };

type RetryIntent =
  | { kind: "restore"; sessionId: string }
  | { kind: "start"; persona?: PersonaId; rematch: boolean }
  | { kind: "action"; command: ClientCommand };

export type EarnQuest = {
  id: string;
  title: string;
  vpReward: number;
  effort: string;
  timeHint: string;
  holdDays: number;
};

const STORAGE_KEY = "vaultquest:vault-bluff:session";
const REVEAL_HOLD_MS = 1_500;
const ROUND_ENTRY_GUARD_MS = 700;

const ANSWER_LABELS: Record<ApprovedAnswer, string> = {
  YES: "Yes",
  NO: "No",
  KEEP_YOURS: "Keep yours",
  TAKE_MINE: "Take mine",
  I_SAW_THE_KEY: "I saw the key",
  I_SAW_AN_EMPTY_CASE: "I saw an empty case",
  I_AM_TELLING_THE_TRUTH: "I am telling the truth",
  I_MIGHT_BE_BLUFFING: "I might be bluffing",
  KEEP: "Keep",
  TAKE: "Take",
  CERTAIN: "Certain",
  UNSURE: "Unsure",
  GUESSING: "Guessing",
};

export function VaultBluffGame({
  faceoffEnabled = false,
  completedMatches,
  initialTotalXp,
  earnQuest,
}: {
  faceoffEnabled?: boolean;
  completedMatches: number;
  initialTotalXp: number;
  earnQuest: EarnQuest | null;
}) {
  const [game, setGame] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [pendingAction, setPendingAction] = useState<ClientCommand["kind"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryIntent, setRetryIntent] = useState<RetryIntent | null>(null);
  const [answer, setAnswer] = useState<ApprovedAnswer | null>(null);
  const [confidence, setConfidence] = useState<Confidence>("UNSURE");
  const [recommendation, setRecommendation] = useState<Recommendation>("KEEP");
  const [revealReady, setRevealReady] = useState(false);
  const [roundControlsReady, setRoundControlsReady] = useState(false);
  const [forfeitConfirmOpen, setForfeitConfirmOpen] = useState(false);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestInFlightRef = useRef(false);
  const continuePointerArmedRef = useRef(false);
  const faceoffAutoStartAttemptedRef = useRef(false);

  function acceptGameResult(result: ApiResult) {
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    continuePointerArmedRef.current = false;
    setGame(result);
    setForfeitConfirmOpen(false);
    const round = result.session.currentRound;
    if (round.phase === "ROUND_REVEAL") {
      setRevealReady(false);
      setRoundControlsReady(false);
      transitionTimerRef.current = setTimeout(() => {
        setRevealReady(true);
        transitionTimerRef.current = null;
      }, REVEAL_HOLD_MS);
    } else if (round.phase === "CHOOSER_QUESTIONING" && round.questions.length === 0) {
      setRevealReady(false);
      setRoundControlsReady(false);
      transitionTimerRef.current = setTimeout(() => {
        setRoundControlsReady(true);
        transitionTimerRef.current = null;
      }, ROUND_ENTRY_GUARD_MS);
    } else {
      setRevealReady(true);
      setRoundControlsReady(true);
    }
  }

  async function loadSession(sessionId: string) {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/games/vault-bluff/sessions/${sessionId}`, {
        cache: "no-store",
      });
      if (response.ok) {
        const result: ApiResult = await response.json();
        acceptGameResult(result);
        setRetryIntent(null);
      } else if (response.status === 404) {
        localStorage.removeItem(STORAGE_KEY);
        setGame(null);
        setRetryIntent(null);
      } else {
        setError("Your match could not be restored. Try again.");
        setRetryIntent({ kind: "restore", sessionId });
      }
    } catch {
      setError("Your match could not be restored. Try again.");
      setRetryIntent({ kind: "restore", sessionId });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) void loadSession(saved);
      else setLoading(false);
    });
    // Restore once from the browser-owned session pointer on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(
    () => () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      continuePointerArmedRef.current = false;
    },
    [],
  );

  async function start(persona?: PersonaId, rematch = false) {
    if (requestInFlightRef.current) return;
    requestInFlightRef.current = true;
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/games/vault-bluff/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona,
          rematch,
        }),
      });
      const body = await response.json();
      if (!response.ok) {
        setError(body?.error?.message ?? "The match could not start.");
        setRetryIntent({ kind: "start", persona, rematch });
      } else {
        const result = body as ApiResult;
        localStorage.setItem(STORAGE_KEY, result.id);
        acceptGameResult(result);
        setRetryIntent(null);
      }
    } catch {
      setError("The match could not start. Check your connection and try again.");
      setRetryIntent({ kind: "start", persona, rematch });
    } finally {
      requestInFlightRef.current = false;
      setPending(false);
    }
  }

  async function act(command: ClientCommand) {
    if (!game || requestInFlightRef.current) return;
    requestInFlightRef.current = true;
    setPending(true);
    setPendingAction(command.kind);
    setError(null);
    try {
      const response = await fetch(
        `/api/games/vault-bluff/sessions/${game.id}/actions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            expectedVersion: game.version,
            clientActionId: crypto.randomUUID(),
            command,
          }),
        },
      );
      const body = await response.json();
      if (!response.ok) {
        setError(body?.error?.message ?? "That action could not be applied.");
        setRetryIntent({ kind: "action", command });
        if (body?.error?.code === "VERSION_CONFLICT") await loadSession(game.id);
      } else {
        acceptGameResult(body as ApiResult);
        setRetryIntent(null);
        setAnswer(null);
        setConfidence("UNSURE");
        setRecommendation("KEEP");
      }
    } catch {
      setError("That action could not be sent. Your saved match is unchanged.");
      setRetryIntent({ kind: "action", command });
    } finally {
      requestInFlightRef.current = false;
      setPending(false);
      setPendingAction(null);
    }
  }

  useEffect(() => {
    if (
      !faceoffEnabled ||
      loading ||
      pending ||
      game ||
      error ||
      faceoffAutoStartAttemptedRef.current
    ) {
      return;
    }
    faceoffAutoStartAttemptedRef.current = true;
    void start();
    // The controller owns the one-time Faceoff bootstrap. The action function
    // intentionally stays outside the dependency list so a render cannot retry it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, faceoffEnabled, game, loading, pending]);

  function retryLast() {
    if (!retryIntent) return;
    if (retryIntent.kind === "restore") {
      void loadSession(retryIntent.sessionId);
    } else if (retryIntent.kind === "start") {
      void start(retryIntent.persona, retryIntent.rematch);
    } else {
      void act(retryIntent.command);
    }
  }

  function submitKeeperResponse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const draft = parseKeeperResponseForm(new FormData(event.currentTarget));
    if (!draft) {
      setError("Choose an answer, confidence, and recommendation before locking your response.");
      setRetryIntent(null);
      return;
    }
    void act({
      kind: "ANSWER_QUESTION",
      ...draft,
    });
  }

  function continueFromReveal(event: MouseEvent<HTMLButtonElement>) {
    const allowed = canSubmitRevealContinue({
      revealReady,
      pending,
      pointerArmed: continuePointerArmedRef.current,
      clickDetail: event.detail,
    });
    continuePointerArmedRef.current = false;
    if (!allowed) return;
    void act({ kind: "NEXT_ROUND" });
  }

  if (loading) {
    if (faceoffEnabled) {
      return <VaultBluffFaceoffLoading message="Restoring your match..." />;
    }
    return (
      <GameShell>
        <p role="status" className="text-[var(--vq-ink-muted)]">Restoring your match...</p>
      </GameShell>
    );
  }

  if (!game) {
    if (faceoffEnabled) {
      return (
        <VaultBluffFaceoffLoading
          message={error ?? "Preparing the BOT table..."}
          retrying={pending}
          onRetry={retryIntent ? retryLast : null}
        />
      );
    }
    return (
      <GameShell>
        <section aria-labelledby="choose-persona">
          <p className="font-[family-name:var(--vq-font-mono)] text-xs uppercase tracking-wider text-[var(--vq-teal)]">
            VaultQuest bot opponent
          </p>
          <h1 id="choose-persona" className="mt-2 font-[family-name:var(--vq-font-display)] text-4xl font-bold">
            Choose a bot persona
          </h1>
          <p className="mt-3 max-w-2xl text-[var(--vq-ink-muted)]">
            Personas change bluff style, confidence, and timing. They never change key placement, rules, XP, or rewards.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {PERSONA_IDS.map((persona) => (
              <button
                key={persona}
                type="button"
                disabled={pending}
                onClick={() => void start(persona)}
                className="rounded-[10px] border border-[var(--vq-border)] bg-[var(--vq-surface)] p-5 text-left hover:border-[var(--vq-teal)] disabled:opacity-50"
              >
                <span className="font-[family-name:var(--vq-font-display)] text-xl font-semibold">
                  {PERSONAS[persona].name}
                </span>
                <span className="ml-2 font-[family-name:var(--vq-font-mono)] text-xs text-[var(--vq-ink-muted)]">
                  {PERSONAS[persona].style}
                </span>
                <span className="mt-2 block text-sm text-[var(--vq-ink-muted)]">
                  {PERSONAS[persona].description}
                </span>
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={() => void start()}
            className="mt-4 rounded-md border border-[var(--vq-border-strong)] px-5 py-3 text-sm font-semibold hover:border-[var(--vq-teal)] hover:text-[var(--vq-teal)] disabled:opacity-50"
          >
            Auto-assign persona
          </button>
          <GameError
            error={error}
            retrying={pending || loading}
            onRetry={retryIntent ? retryLast : null}
          />
        </section>
      </GameShell>
    );
  }

  const round = game.session.currentRound;
  const persona = PERSONAS[game.session.persona];
  const activeQuestion =
    round.humanRole === "KEEPER" ? round.questions[round.responses.length] : undefined;

  if (shouldRenderVaultBluffFaceoff(faceoffEnabled, round.phase)) {
    return (
      <VaultBluffFaceoff
        game={game}
        pending={pending}
        error={error}
        retryAvailable={Boolean(retryIntent)}
        revealReady={revealReady}
        onAction={(command) => void act(command)}
        onRetry={retryLast}
        onRematch={() => void start(game.session.persona, true)}
        onNewBot={() => void start()}
        onContinue={continueFromReveal}
        onContinuePointerDown={() => {
          continuePointerArmedRef.current = revealReady && !pending;
        }}
        onContinuePointerReset={() => {
          continuePointerArmedRef.current = false;
        }}
      />
    );
  }

  return (
    <GameShell>
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--vq-border)] pb-5">
        <div>
          <p className="font-[family-name:var(--vq-font-mono)] text-xs uppercase tracking-wider text-[var(--vq-teal)]">
            VaultQuest bot · {persona.name}
          </p>
          <h1 className="mt-1 font-[family-name:var(--vq-font-display)] text-3xl font-bold">Vault Bluff</h1>
          <RoundRail currentRound={round.number} />
          <p className="mt-2 text-sm text-[var(--vq-ink-muted)]">
            You are the {round.humanRole.toLowerCase()}
          </p>
        </div>
        <div className="flex gap-5 font-[family-name:var(--vq-font-mono)] text-sm">
          <span>You {game.session.humanScore}</span>
          <span>Bot {game.session.botScore}</span>
        </div>
      </header>

      <div className="mt-6">
        {round.phase === "KEEPER_INSPECTION" ? (
          <section aria-labelledby="inspection-title">
            <StageLabel>Private inspection</StageLabel>
            <h2 id="inspection-title" className="mt-2 text-2xl font-semibold">
              Case A is yours
            </h2>
            <CasePair highlighted="CASE_A" />
            <p className="mt-5 rounded-[10px] border border-[var(--vq-brass-dim)] bg-[var(--vq-bg-sunken)] p-4 text-lg">
              {round.keeperHasKey ? "The Vault Key is inside your case." : "Your case is empty."}
            </p>
            <button
              type="button"
              disabled={pending}
              onClick={() => void act({ kind: "ACK_INSPECTION" })}
              className="mt-5 rounded-md bg-[var(--vq-teal)] px-5 py-3 font-semibold text-[var(--vq-bg-deep)] disabled:opacity-50"
            >
              Ready for questions
            </button>
          </section>
        ) : null}

        {round.phase === "KEEPER_RESPONSE" && activeQuestion ? (
          <form aria-labelledby="response-title" onSubmit={submitKeeperResponse}>
            <StageLabel>Bot asks · question {round.responses.length + 1} of 2</StageLabel>
            <h2 id="response-title" className="mt-2 text-2xl font-semibold">
              {QUESTION_LABELS[activeQuestion]}
            </h2>
            {round.responses.length > 0 ? <ResponseHistory responses={round.responses} /> : null}
            {pendingAction === "ANSWER_QUESTION" && round.responses.length === 1 ? (
              <p
                role="status"
                aria-live="polite"
                className="vq-bot-thinking mt-5 rounded-md border border-[var(--vq-teal)]/40 bg-[var(--vq-teal-glow)] px-4 py-3 text-sm text-[var(--vq-teal)]"
              >
                VaultQuest bot is choosing…
              </p>
            ) : null}
            <fieldset className="mt-6">
              <legend className="text-sm font-semibold">Approved answer</legend>
              <input type="hidden" name="answer" value={answer ?? ""} />
              <div className="mt-2 flex flex-wrap gap-2">
                {APPROVED_ANSWERS[activeQuestion].map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={answer === option}
                    onClick={() => setAnswer(option)}
                    className={`min-h-11 min-w-11 rounded-md border px-4 py-2 text-sm ${
                      answer === option
                        ? "border-[var(--vq-teal)] bg-[var(--vq-teal-glow)] text-[var(--vq-teal)]"
                        : "border-[var(--vq-border)]"
                    }`}
                  >
                    {ANSWER_LABELS[option]}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <SelectField
                label="Confidence"
                name="confidence"
                value={confidence}
                onChange={(value) => setConfidence(value as Confidence)}
                options={["CERTAIN", "UNSURE", "GUESSING"]}
              />
              <SelectField
                label="Recommendation"
                name="recommendation"
                value={recommendation}
                onChange={(value) => setRecommendation(value as Recommendation)}
                options={["KEEP", "TAKE"]}
              />
            </div>
            <button
              type="submit"
              disabled={pending}
              className="mt-5 rounded-md bg-[var(--vq-teal)] px-5 py-3 font-semibold text-[var(--vq-bg-deep)] disabled:opacity-40"
            >
              {pendingAction === "ANSWER_QUESTION" ? "Locking response…" : "Lock response"}
            </button>
          </form>
        ) : null}

        {round.phase === "CHOOSER_QUESTIONING" ? (
          <section aria-labelledby="question-title">
            <StageLabel>Your questions · {round.questions.length} of 2 asked</StageLabel>
            <h2 id="question-title" className="mt-2 text-2xl font-semibold">
              Choose two questions for the {persona.name}
            </h2>
            <CasePair highlighted="CASE_A" />
            {!roundControlsReady && round.questions.length === 0 ? (
              <p role="status" className="mt-5 text-sm text-[var(--vq-ink-muted)]">
                New round ready. Questions unlock in a moment…
              </p>
            ) : null}
            {pendingAction === "ASK_QUESTION" ? (
              <p
                role="status"
                aria-live="polite"
                className="vq-bot-thinking mt-5 rounded-md border border-[var(--vq-teal)]/40 bg-[var(--vq-teal-glow)] px-4 py-3 text-sm text-[var(--vq-teal)]"
              >
                VaultQuest bot is answering…
              </p>
            ) : null}
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  disabled={
                    pending ||
                    !roundControlsReady ||
                    round.questions.includes(question)
                  }
                  onClick={() => void act({ kind: "ASK_QUESTION", question })}
                  className="min-h-11 rounded-md border border-[var(--vq-border)] bg-[var(--vq-surface)] p-3 text-left text-sm hover:border-[var(--vq-teal)] disabled:opacity-35"
                >
                  {QUESTION_LABELS[question]}
                </button>
              ))}
            </div>
            <ResponseHistory responses={round.responses} />
          </section>
        ) : null}

        {round.phase === "CHOOSER_DECISION" ? (
          <section aria-labelledby="decision-title">
            <StageLabel>Final choice</StageLabel>
            <h2 id="decision-title" className="mt-2 text-2xl font-semibold">Keep Case A or take Case B?</h2>
            <CasePair highlighted="CASE_A" />
            <ResponseHistory responses={round.responses} />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => void act({ kind: "CHOOSE_CASE", choice: "KEEP" })}
                className="vq-choice-button vq-choice-button--keep rounded-md px-5 py-4 text-lg font-bold disabled:opacity-50"
              >
                Keep my Case A
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => void act({ kind: "CHOOSE_CASE", choice: "TAKE" })}
                className="vq-choice-button vq-choice-button--take rounded-md border px-5 py-4 text-lg font-bold disabled:opacity-50"
              >
                Take bot Case B
              </button>
            </div>
          </section>
        ) : null}

        {round.phase === "ROUND_REVEAL" ? (
          <section aria-labelledby="reveal-title">
            {round.humanRole === "KEEPER" && round.choice ? (
              <div
                aria-live="polite"
                className="mb-4 rounded-[10px] border border-[var(--vq-border-strong)] bg-[var(--vq-surface)] p-5"
              >
                <p className="font-[family-name:var(--vq-font-mono)] text-xs uppercase tracking-wider text-[var(--vq-teal)]">
                  Bot decision
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  {round.choice === "KEEP"
                    ? `${persona.name} kept bot Case B`
                    : `${persona.name} took your Case A`}
                </h2>
                <p className="mt-2 text-sm text-[var(--vq-ink-muted)]">
                  {round.choice === "KEEP"
                    ? "The bot finished the round holding its original case."
                    : "The bot swapped and finished the round holding your original case."}
                </p>
              </div>
            ) : null}
            <div className="rounded-[10px] border border-[var(--vq-brass-dim)] bg-[var(--vq-bg-sunken)] p-5">
              <StageLabel>Key reveal</StageLabel>
              <h2 id="reveal-title" className="mt-2 text-3xl font-semibold">
                Vault Key revealed
              </h2>
              <CasePair highlighted={round.keyCase} revealed />
              <p className="mt-4 text-sm text-[var(--vq-ink-muted)]">
                The key was in {round.keyCase === "CASE_A" ? "Case A" : "Case B"}.
              </p>
            </div>
            <div className="mt-4 rounded-[10px] border border-[var(--vq-border-strong)] bg-[var(--vq-surface)] p-5">
              <p className="font-[family-name:var(--vq-font-mono)] text-xs uppercase tracking-wider text-[var(--vq-teal)]">
                Round result
              </p>
              <h3 className="mt-2 text-2xl font-semibold">
                {round.winner === "HUMAN" ? "Point to you" : "Point to the VaultQuest bot"}
              </h3>
            </div>
            {!revealReady ? (
              <p role="status" className="mt-4 text-sm text-[var(--vq-ink-muted)]">
                Reveal locked briefly so it cannot be skipped…
              </p>
            ) : null}
            <button
              type="button"
              disabled={pending || !revealReady}
              onPointerDown={() => {
                continuePointerArmedRef.current = revealReady && !pending;
              }}
              onPointerCancel={() => {
                continuePointerArmedRef.current = false;
              }}
              onPointerLeave={() => {
                continuePointerArmedRef.current = false;
              }}
              onClick={continueFromReveal}
              className="mt-5 rounded-md bg-[var(--vq-teal)] px-5 py-3 font-semibold text-[var(--vq-bg-deep)] disabled:opacity-50"
            >
              {!revealReady
                ? "Continue available shortly"
                : round.number === 4
                  ? "Continue to match result"
                  : "Continue to next round"}
            </button>
          </section>
        ) : null}

        {round.phase === "MATCH_COMPLETE" ? (
          <MatchResult
            game={game}
            totalXp={initialTotalXp + game.session.xpAwarded}
            completedMatches={completedMatches + (game.session.forfeited ? 0 : 1)}
            earnQuest={earnQuest}
            pending={pending}
            onRematch={() => void start(game.session.persona, true)}
          />
        ) : null}
      </div>

      <GameError
        error={error}
        retrying={pending || loading}
        onRetry={retryIntent ? retryLast : null}
      />
      {!game.session.completed ? (
        <section className="mt-12 border-t border-[var(--vq-border)] pt-6" aria-label="Match options">
          {forfeitConfirmOpen ? (
            <div className="rounded-[10px] border border-[var(--vq-danger)]/50 bg-[var(--vq-danger)]/10 p-4">
              <h2 className="font-semibold text-[var(--vq-danger)]">Forfeit this match?</h2>
              <p className="mt-1 text-sm text-[var(--vq-ink-muted)]">
                The match ends with no XP or promotional VP and will not train player memory.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setForfeitConfirmOpen(false)}
                  className="inline-flex min-h-11 items-center rounded-md border border-[var(--vq-border-strong)] px-4 py-2 text-sm font-semibold disabled:opacity-50"
                >
                  Keep playing
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    setForfeitConfirmOpen(false);
                    void act({ kind: "FORFEIT" });
                  }}
                  className="inline-flex min-h-11 items-center rounded-md border border-[var(--vq-danger)] px-4 py-2 text-sm font-semibold text-[var(--vq-danger)] disabled:opacity-50"
                >
                  Confirm forfeit
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={pending}
              onClick={() => setForfeitConfirmOpen(true)}
              className="inline-flex min-h-11 items-center rounded-md border border-[var(--vq-border)] px-4 py-2 text-sm text-[var(--vq-ink-faint)] hover:border-[var(--vq-danger)]/60 hover:text-[var(--vq-danger)] disabled:opacity-50"
            >
              Forfeit options
            </button>
          )}
        </section>
      ) : null}
    </GameShell>
  );
}

function MatchResult({
  game,
  totalXp,
  completedMatches,
  earnQuest,
  pending,
  onRematch,
}: {
  game: ApiResult;
  totalXp: number;
  completedMatches: number;
  earnQuest: EarnQuest | null;
  pending: boolean;
  onRematch: () => void;
}) {
  const result = game.session.forfeited
    ? "Match forfeited"
    : game.session.humanScore > game.session.botScore
      ? "Match won"
      : game.session.humanScore < game.session.botScore
        ? "Match lost"
        : "Match tied";
  return (
    <section aria-labelledby="match-title">
      <StageLabel>Match result</StageLabel>
      <h2 id="match-title" className="mt-2 font-[family-name:var(--vq-font-display)] text-4xl font-bold">{result}</h2>
      <p className="mt-3 text-[var(--vq-ink-muted)]">
        Final score: you {game.session.humanScore}, bot {game.session.botScore}.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[10px] border border-[var(--vq-border)] bg-[var(--vq-surface)] p-4">
          <p className="text-xs uppercase tracking-wider text-[var(--vq-ink-faint)]">XP earned</p>
          <p className="mt-1 font-[family-name:var(--vq-font-mono)] text-2xl text-[var(--vq-teal)]">
            +{game.session.xpAwarded} XP
          </p>
          <p className="mt-1 text-xs text-[var(--vq-ink-muted)]">{totalXp} total XP</p>
        </div>
        <RewardState reward={game.reward} forfeited={game.session.forfeited} />
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={onRematch}
        className="vq-rematch-glow mt-6 min-h-11 rounded-md bg-[var(--vq-teal)] px-5 py-3 font-semibold text-[var(--vq-bg-deep)] disabled:opacity-50"
      >
        Instant rematch
      </button>
      {completedMatches >= 3 ? (
        earnQuest ? (
          <aside className="mt-8 rounded-[10px] border border-[var(--vq-border)] bg-[var(--vq-bg-raised)] p-5">
            <p className="text-xs uppercase tracking-wider text-[var(--vq-teal)]">Optional verified quest</p>
            <h3 className="mt-1 text-lg font-semibold">{earnQuest.title}</h3>
            <p className="mt-2 text-sm text-[var(--vq-ink-muted)]">
              {earnQuest.vpReward} VP · {earnQuest.effort} effort · {earnQuest.timeHint} · {earnQuest.holdDays}-day hold.
            </p>
            <p className="mt-2 text-xs text-[var(--vq-ink-faint)]">
              Clicking pays nothing. VP posts only after a verified partner completion.
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
              className="mt-4 inline-flex min-h-11 items-center rounded-md border border-[var(--vq-teal)] px-4 py-2 text-sm font-semibold text-[var(--vq-teal)]"
            >
              Open optional quest
            </a>
          </aside>
        ) : (
          <aside className="mt-8 rounded-[10px] border border-[var(--vq-border)] bg-[var(--vq-bg-raised)] p-5">
            <p className="text-xs uppercase tracking-wider text-[var(--vq-ink-faint)]">
              Optional verified quest
            </p>
            <h3 className="mt-1 text-lg font-semibold">No verified quest available right now</h3>
            <p className="mt-2 text-sm text-[var(--vq-ink-muted)]">
              The rotation found no healthy partner quest under its cap. Nothing is being hidden or substituted. Check Earn later.
            </p>
          </aside>
        )
      ) : null}
      <p className="mt-6 text-sm text-[var(--vq-ink-muted)]">
        Verified quests remain the main VP source.{" "}
        <Link href="/earn" className="text-[var(--vq-teal)] hover:underline">Browse Earn</Link>
      </p>
    </section>
  );
}

function RewardState({
  reward,
  forfeited,
}: {
  reward: ApiResult["reward"];
  forfeited: boolean;
}) {
  if (forfeited) {
    return <StatusCard title="Daily promo" body="Forfeits do not qualify." />;
  }
  if (reward?.kind === "granted") {
    return (
      <StatusCard
        title="Reward pending"
        body={`${reward.vp} VP pending until ${new Date(reward.availableAt).toLocaleString()}.`}
        accent
      />
    );
  }
  if (reward?.kind === "blocked" && reward.reason === "daily_grant_exists") {
    return (
      <StatusCard
        title="Daily cap reached"
        body="1 promotional VP for this UTC day was already granted. Play stays open, and no additional VP was added."
      />
    );
  }
  if (reward?.kind === "blocked" && reward.reason === "rolling_cap_reached") {
    return <StatusCard title="30-day cap reached" body="Play stays open. No promotional VP was added." />;
  }
  return (
    <StatusCard
      title="Daily promo disabled"
      body="No VP was added. Funding reserve and owner kill switch are not configured."
    />
  );
}

function StatusCard({ title, body, accent = false }: { title: string; body: string; accent?: boolean }) {
  return (
    <div className="rounded-[10px] border border-[var(--vq-border)] bg-[var(--vq-surface)] p-4">
      <p className="text-xs uppercase tracking-wider text-[var(--vq-ink-faint)]">{title}</p>
      <p className={`mt-2 text-sm ${accent ? "text-[var(--vq-teal)]" : "text-[var(--vq-ink-muted)]"}`}>{body}</p>
    </div>
  );
}

function ResponseHistory({ responses }: { responses: SafeSessionDto["currentRound"]["responses"] }) {
  if (responses.length === 0) return null;
  return (
    <ol className="mt-5 space-y-2">
      {responses.map((response, index) => (
        <li key={`${response.question}-${index}`} className="rounded-md border border-[var(--vq-border)] bg-[var(--vq-bg-sunken)] p-3 text-sm">
          <p className="text-[var(--vq-ink-faint)]">{QUESTION_LABELS[response.question]}</p>
          <p className="mt-1">
            {ANSWER_LABELS[response.answer]} · {ANSWER_LABELS[response.confidence]} · recommends {response.recommendation.toLowerCase()}
          </p>
        </li>
      ))}
    </ol>
  );
}

function CasePair({ highlighted, revealed = false }: { highlighted?: "CASE_A" | "CASE_B"; revealed?: boolean }) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3" aria-label="Case A and Case B">
      {(["CASE_A", "CASE_B"] as const).map((caseId) => (
        <div
          key={caseId}
          className={`grid min-h-28 place-items-center rounded-[10px] border-2 bg-[var(--vq-bg-sunken)] ${
            highlighted === caseId ? "border-[var(--vq-brass)]" : "border-[var(--vq-border)]"
          } ${revealed && highlighted === caseId ? "vq-case-winner" : ""}`}
        >
          <div className="text-center">
            <span className="block text-3xl text-[var(--vq-brass)]" aria-hidden="true">
              {revealed && highlighted === caseId ? "◆" : "▣"}
            </span>
            <span className="mt-1 block font-[family-name:var(--vq-font-mono)] text-sm">
              {caseId === "CASE_A" ? "Case A · Yours" : "Case B · Bot"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function SelectField({
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
        className="w-full rounded-md border border-[var(--vq-border)] bg-[var(--vq-bg-sunken)] px-3 py-2"
      >
        {options.map((option) => (
          <option key={option} value={option}>{ANSWER_LABELS[option as ApprovedAnswer] ?? option}</option>
        ))}
      </select>
    </label>
  );
}

function RoundRail({ currentRound }: { currentRound: number }) {
  return (
    <div
      className="vq-round-rail mt-3"
      role="progressbar"
      aria-label={`Round ${currentRound} of 4`}
      aria-valuemin={1}
      aria-valuemax={4}
      aria-valuenow={currentRound}
    >
      <span className="mr-1 font-[family-name:var(--vq-font-mono)] text-xs text-[var(--vq-ink-muted)]">
        Round {currentRound} of 4
      </span>
      {[1, 2, 3, 4].map((roundNumber) => (
        <span
          key={roundNumber}
          className="vq-round-dot"
          data-state={
            roundNumber < currentRound
              ? "done"
              : roundNumber === currentRound
                ? "current"
                : "remaining"
          }
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function StageLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-[family-name:var(--vq-font-mono)] text-xs uppercase tracking-wider text-[var(--vq-teal)]">
      {children}
    </p>
  );
}

function GameError({
  error,
  retrying,
  onRetry,
}: {
  error: string | null;
  retrying: boolean;
  onRetry: (() => void) | null;
}) {
  return error ? (
    <section
      role="alert"
      aria-labelledby="vault-bluff-error-title"
      className="mt-5 rounded-md border border-[var(--vq-danger)]/50 bg-[var(--vq-danger)]/10 p-4"
    >
      <h2 id="vault-bluff-error-title" className="font-semibold text-[var(--vq-danger)]">
        Match connection issue
      </h2>
      <p className="mt-1 text-sm text-[var(--vq-ink-muted)]">{error}</p>
      {onRetry ? (
        <button
          type="button"
          disabled={retrying}
          onClick={onRetry}
          className="mt-3 inline-flex min-h-11 items-center rounded-md border border-[var(--vq-danger)]/60 px-4 py-2 text-sm font-semibold text-[var(--vq-ink)] hover:bg-[var(--vq-danger)]/10 disabled:opacity-50"
        >
          {retrying ? "Retrying…" : "Retry"}
        </button>
      ) : null}
    </section>
  ) : null;
}

function GameShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="rounded-[12px] border border-[var(--vq-border-strong)] bg-[var(--vq-bg-raised)] p-5 sm:p-8">
        {children}
      </div>
      <p className="mt-4 text-center text-xs text-[var(--vq-ink-faint)]">
        Server-authoritative · structured responses only · no cash or random prize
      </p>
    </div>
  );
}
