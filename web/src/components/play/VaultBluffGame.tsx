"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { captureClientEvent, PH_EVENTS } from "@/lib/posthog-client";
import { PERSONAS } from "@/lib/vault-bluff/personas";
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

type ApiResult = {
  id: string;
  version: number;
  session: SafeSessionDto;
  reward:
    | { kind: "granted"; vp: number; availableAt: string }
    | { kind: "blocked"; reason: string }
    | null;
};

type ClientCommand =
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

type EarnQuest = {
  id: string;
  title: string;
  vpReward: number;
  effort: string;
  timeHint: string;
  holdDays: number;
};

const STORAGE_KEY = "vaultquest:vault-bluff:session";

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
  completedMatches,
  initialTotalXp,
  earnQuest,
}: {
  completedMatches: number;
  initialTotalXp: number;
  earnQuest: EarnQuest | null;
}) {
  const [game, setGame] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState<ApprovedAnswer | null>(null);
  const [confidence, setConfidence] = useState<Confidence>("UNSURE");
  const [recommendation, setRecommendation] = useState<Recommendation>("KEEP");

  async function loadSession(sessionId: string) {
    setLoading(true);
    const response = await fetch(`/api/games/vault-bluff/sessions/${sessionId}`, {
      cache: "no-store",
    });
    if (response.ok) {
      const result: ApiResult = await response.json();
      setGame(result);
    } else if (response.status === 404) {
      localStorage.removeItem(STORAGE_KEY);
      setGame(null);
    } else {
      setError("Your match could not be restored. Try again.");
    }
    setLoading(false);
  }

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) void loadSession(saved);
    else setLoading(false);
  }, []);

  async function start(persona?: PersonaId, rematch = false) {
    setPending(true);
    setError(null);
    const response = await fetch("/api/games/vault-bluff/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ persona, rematch }),
    });
    const body = await response.json();
    if (!response.ok) {
      setError(body?.error?.message ?? "The match could not start.");
    } else {
      const result = body as ApiResult;
      localStorage.setItem(STORAGE_KEY, result.id);
      setGame(result);
    }
    setPending(false);
  }

  async function act(command: ClientCommand) {
    if (!game) return;
    setPending(true);
    setError(null);
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
      if (body?.error?.code === "VERSION_CONFLICT") await loadSession(game.id);
    } else {
      setGame(body as ApiResult);
      setAnswer(null);
      setConfidence("UNSURE");
      setRecommendation("KEEP");
    }
    setPending(false);
  }

  if (loading) {
    return (
      <GameShell>
        <p role="status" className="text-[var(--vq-ink-muted)]">Restoring your match...</p>
      </GameShell>
    );
  }

  if (!game) {
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
                <span className="ml-2 font-[family-name:var(--vq-font-mono)] text-xs text-[var(--vq-brass)]">
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
          <GameError error={error} />
        </section>
      </GameShell>
    );
  }

  const round = game.session.currentRound;
  const persona = PERSONAS[game.session.persona];
  const activeQuestion =
    round.humanRole === "KEEPER" ? round.questions[round.responses.length] : undefined;

  return (
    <GameShell>
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--vq-border)] pb-5">
        <div>
          <p className="font-[family-name:var(--vq-font-mono)] text-xs uppercase tracking-wider text-[var(--vq-teal)]">
            VaultQuest bot · {persona.name}
          </p>
          <h1 className="mt-1 font-[family-name:var(--vq-font-display)] text-3xl font-bold">Vault Bluff</h1>
          <p className="mt-1 text-sm text-[var(--vq-ink-muted)]">
            Round {round.number} of 4 · You are the {round.humanRole.toLowerCase()}
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
          <section aria-labelledby="response-title">
            <StageLabel>Bot asks · question {round.responses.length + 1} of 2</StageLabel>
            <h2 id="response-title" className="mt-2 text-2xl font-semibold">
              {QUESTION_LABELS[activeQuestion]}
            </h2>
            {round.responses.length > 0 ? <ResponseHistory responses={round.responses} /> : null}
            <fieldset className="mt-6">
              <legend className="text-sm font-semibold">Approved answer</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {APPROVED_ANSWERS[activeQuestion].map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={answer === option}
                    onClick={() => setAnswer(option)}
                    className={`rounded-md border px-4 py-2 text-sm ${
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
                value={confidence}
                onChange={(value) => setConfidence(value as Confidence)}
                options={["CERTAIN", "UNSURE", "GUESSING"]}
              />
              <SelectField
                label="Recommendation"
                value={recommendation}
                onChange={(value) => setRecommendation(value as Recommendation)}
                options={["KEEP", "TAKE"]}
              />
            </div>
            <button
              type="button"
              disabled={pending || !answer}
              onClick={() =>
                answer &&
                void act({
                  kind: "ANSWER_QUESTION",
                  answer,
                  confidence,
                  recommendation,
                })
              }
              className="mt-5 rounded-md bg-[var(--vq-teal)] px-5 py-3 font-semibold text-[var(--vq-bg-deep)] disabled:opacity-40"
            >
              Lock response
            </button>
          </section>
        ) : null}

        {round.phase === "CHOOSER_QUESTIONING" ? (
          <section aria-labelledby="question-title">
            <StageLabel>Your questions · {round.questions.length} of 2 asked</StageLabel>
            <h2 id="question-title" className="mt-2 text-2xl font-semibold">
              Question the {persona.name}
            </h2>
            <CasePair highlighted="CASE_A" />
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  disabled={pending || round.questions.includes(question)}
                  onClick={() => void act({ kind: "ASK_QUESTION", question })}
                  className="rounded-md border border-[var(--vq-border)] bg-[var(--vq-surface)] p-3 text-left text-sm hover:border-[var(--vq-teal)] disabled:opacity-35"
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
                className="rounded-md bg-[var(--vq-teal)] px-5 py-4 font-semibold text-[var(--vq-bg-deep)] disabled:opacity-50"
              >
                Keep my Case A
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => void act({ kind: "CHOOSE_CASE", choice: "TAKE" })}
                className="rounded-md border border-[var(--vq-brass)] px-5 py-4 font-semibold text-[var(--vq-brass)] disabled:opacity-50"
              >
                Take bot Case B
              </button>
            </div>
          </section>
        ) : null}

        {round.phase === "ROUND_REVEAL" ? (
          <section aria-labelledby="reveal-title">
            <StageLabel>Key revealed</StageLabel>
            <h2 id="reveal-title" className="mt-2 text-3xl font-semibold">
              {round.winner === "HUMAN" ? "You found the Vault Key." : "The bot found the Vault Key."}
            </h2>
            <CasePair highlighted={round.keyCase} revealed />
            <p className="mt-4 text-sm text-[var(--vq-ink-muted)]">
              The key was in {round.keyCase === "CASE_A" ? "Case A" : "Case B"}. It awards one round point only.
            </p>
            <button
              type="button"
              disabled={pending}
              onClick={() => void act({ kind: "NEXT_ROUND" })}
              className="mt-5 rounded-md bg-[var(--vq-teal)] px-5 py-3 font-semibold text-[var(--vq-bg-deep)] disabled:opacity-50"
            >
              {round.number === 4 ? "See match result" : "Next round"}
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

      <GameError error={error} />
      {!game.session.completed ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => void act({ kind: "FORFEIT" })}
          className="mt-8 text-xs text-[var(--vq-ink-faint)] underline hover:text-[var(--vq-danger)] disabled:opacity-50"
        >
          Forfeit match
        </button>
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
          <p className="mt-1 font-[family-name:var(--vq-font-mono)] text-2xl text-[var(--vq-brass)]">
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
        className="mt-6 rounded-md bg-[var(--vq-teal)] px-5 py-3 font-semibold text-[var(--vq-bg-deep)] disabled:opacity-50"
      >
        Instant rematch
      </button>
      {completedMatches >= 3 && earnQuest ? (
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
            className="mt-4 inline-flex rounded-md border border-[var(--vq-teal)] px-4 py-2 text-sm font-semibold text-[var(--vq-teal)]"
          >
            Open optional quest
          </a>
        </aside>
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
          <p className="mt-1 font-[family-name:var(--vq-font-mono)] text-xs text-[var(--vq-ink-faint)]">
            Server measured {response.durationMs} ms
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
          }`}
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
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-sm">
      <span className="mb-1 block font-semibold">{label}</span>
      <select
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

function StageLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-[family-name:var(--vq-font-mono)] text-xs uppercase tracking-wider text-[var(--vq-teal)]">
      {children}
    </p>
  );
}

function GameError({ error }: { error: string | null }) {
  return error ? (
    <p role="alert" className="mt-5 rounded-md border border-[var(--vq-danger)]/50 bg-[var(--vq-danger)]/10 p-3 text-sm text-[var(--vq-danger)]">
      {error}
    </p>
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
