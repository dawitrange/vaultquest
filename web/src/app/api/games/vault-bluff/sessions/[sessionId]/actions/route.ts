import { z } from "zod";
import { auth } from "@/auth";
import { PH_EVENTS, captureServerEvent } from "@/lib/posthog-server";
import {
  GameServiceError,
  applyGameAction,
} from "@/lib/vault-bluff/service";
import {
  APPROVED_ANSWER_IDS,
  QUESTIONS,
  VaultBluffError,
} from "@/lib/vault-bluff/types";

const commandSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("ACK_INSPECTION") }),
  z.object({ kind: z.literal("ASK_QUESTION"), question: z.enum(QUESTIONS) }),
  z.object({
    kind: z.literal("ANSWER_QUESTION"),
    answer: z.enum(APPROVED_ANSWER_IDS),
    confidence: z.enum(["CERTAIN", "UNSURE", "GUESSING"]),
    recommendation: z.enum(["KEEP", "TAKE"]),
  }),
  z.object({ kind: z.literal("CHOOSE_CASE"), choice: z.enum(["KEEP", "TAKE"]) }),
  z.object({ kind: z.literal("NEXT_ROUND") }),
  z.object({ kind: z.literal("FORFEIT") }),
]);

const actionSchema = z.object({
  expectedVersion: z.number().int().positive(),
  clientActionId: z.string().uuid(),
  command: commandSchema,
});

export async function POST(
  request: Request,
  context: { params: Promise<{ sessionId: string }> },
) {
  const authSession = await auth();
  if (!authSession?.user?.id) {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in to play Vault Bluff" } },
      { status: 401 },
    );
  }
  const parsed = actionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { error: { code: "INVALID_REQUEST", message: "That game action is not valid" } },
      { status: 400 },
    );
  }

  const { sessionId } = await context.params;
  const now = new Date().toISOString();
  try {
    const result = await applyGameAction({
      userId: authSession.user.id,
      sessionId,
      expectedVersion: parsed.data.expectedVersion,
      clientActionId: parsed.data.clientActionId,
      command: { ...parsed.data.command, now },
    });
    const current = result.session.currentRound;
    const events: Promise<void>[] = [];
    if (current.resolvedAt && parsed.data.command.kind !== "NEXT_ROUND") {
      events.push(
        captureServerEvent(authSession.user.id, PH_EVENTS.vault_bluff_round_completed, {
          engine_version: result.session.engineVersion,
          policy_version: result.session.policyVersion,
          persona: result.session.persona,
          round_count: current.number,
        }),
      );
    }
    if (result.session.completed && !result.session.forfeited) {
      events.push(
        captureServerEvent(authSession.user.id, PH_EVENTS.vault_bluff_completed, {
          engine_version: result.session.engineVersion,
          policy_version: result.session.policyVersion,
          persona: result.session.persona,
          completion: true,
          round_count: result.session.rounds.length,
          xp: result.session.xpAwarded,
          reward_eligibility: result.reward?.kind === "granted",
        }),
      );
    }
    if (result.reward) {
      events.push(
        captureServerEvent(
          authSession.user.id,
          result.reward.kind === "granted"
            ? PH_EVENTS.vault_bluff_daily_vp_granted
            : PH_EVENTS.vault_bluff_reward_blocked,
          {
            engine_version: result.session.engineVersion,
            policy_version: result.session.policyVersion,
            safe_error_reason:
              result.reward.kind === "blocked" ? result.reward.reason : undefined,
          },
        ),
      );
    }
    await Promise.all(events);
    return Response.json(result);
  } catch (error) {
    if (error instanceof VaultBluffError) {
      return Response.json(
        { error: { code: error.code, message: error.message } },
        { status: 409 },
      );
    }
    if (error instanceof GameServiceError) {
      return Response.json(
        { error: { code: error.code, message: error.message } },
        { status: error.code === "NOT_FOUND" ? 404 : 409 },
      );
    }
    return Response.json(
      { error: { code: "INTERNAL_ERROR", message: "The game could not update safely" } },
      { status: 500 },
    );
  }
}
